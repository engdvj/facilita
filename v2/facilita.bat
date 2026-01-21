@echo off
setlocal EnableExtensions DisableDelayedExpansion

REM -----------------------------------------------------------------------------
REM Facilita V2 - One-shot secure deploy/operate script (Windows)
REM
REM Usage:
REM   facilita.bat                (default: up)
REM   facilita.bat up
REM   facilita.bat down
REM   facilita.bat restart
REM   facilita.bat status
REM   facilita.bat logs [service]
REM   facilita.bat clean          (DANGEROUS)
REM
REM What it does for security:
REM   - Creates .env (from .env.production/.env.example if present) if missing
REM   - Replaces known insecure defaults (postgres password, JWT secrets, superadmin password)
REM   - Generates cryptographically strong, URL-safe secrets (avoids breaking DATABASE_URL)
REM   - Generates compose.secure.yml to bind DB/Redis/App ports ONLY to 127.0.0.1
REM     (so only Nginx is reachable from your LAN)
REM -----------------------------------------------------------------------------

cd /d "%~dp0"

set "ACTION=%~1"
if "%ACTION%"=="" set "ACTION=up"

set "ENV_PATH=%CD%\.env"
set "SECURE_COMPOSE_FILE=%CD%\compose.secure.yml"

call :ensure_dirs
call :ensure_env_secure
call :ensure_secure_compose

if /i "%ACTION%"=="up" goto :up
if /i "%ACTION%"=="down" goto :down
if /i "%ACTION%"=="restart" goto :restart
if /i "%ACTION%"=="status" goto :status
if /i "%ACTION%"=="logs" goto :logs
if /i "%ACTION%"=="clean" goto :clean
if /i "%ACTION%"=="help" goto :usage
if /i "%ACTION%"=="--help" goto :usage
if /i "%ACTION%"=="-h" goto :usage
goto :usage

:up
echo Starting services...
call :compose up -d --build
echo.
call :print_access
goto :end

:down
echo Stopping services...
call :compose down
goto :end

:restart
echo Restarting services...
call :compose down
call :compose up -d --build
echo.
call :print_access
goto :end

:status
call :compose ps
goto :end

:logs
REM optional service name in %2
call :compose logs -f %2
goto :end

:clean
echo WARNING: This will remove containers, volumes, and images for this project.
set /p CONFIRM=Are you sure? (y/N):
if /i "%CONFIRM%"=="y" (
  call :compose down -v --rmi all
  echo Cleanup complete.
) else (
  echo Cancelled.
)
goto :end

:usage
echo Usage: %~nx0 {up^|down^|restart^|status^|logs [service]^|clean}
echo.
echo Notes:
echo   - This script will create/adjust .env only to replace known insecure defaults.
echo   - It generates compose.secure.yml to bind internal ports to 127.0.0.1.
goto :end

:compose
REM Uses docker compose with explicit env-file + secure override
REM Requires docker compose plugin or docker-compose v2.
docker compose --env-file "%ENV_PATH%" -f "docker-compose.yml" -f "%SECURE_COMPOSE_FILE%" %*
exit /b

:ensure_dirs
if not exist "backend\uploads\images" mkdir "backend\uploads\images"
if not exist "backend\uploads\documents" mkdir "backend\uploads\documents"
if not exist "backend\backups\auto" mkdir "backend\backups\auto"
if not exist "backend\backups\tmp" mkdir "backend\backups\tmp"
exit /b

:ensure_secure_compose
REM Bind sensitive ports to localhost only (prevents LAN exposure)
(
  echo services:
  echo   postgres:
  echo     ports:
  echo       - "127.0.0.1:5432:5432"
  echo   redis:
  echo     ports:
  echo       - "127.0.0.1:6379:6379"
  echo   backend:
  echo     ports:
  echo       - "127.0.0.1:3001:3001"
  echo   frontend:
  echo     ports:
  echo       - "127.0.0.1:3000:3000"
) > "%SECURE_COMPOSE_FILE%"
exit /b

:ensure_env_secure
set "ENV_TEMPLATE="

if not exist "%ENV_PATH%" (
  if exist ".env.production" (
    set "ENV_TEMPLATE=.env.production"
  ) else if exist ".env.example" (
    set "ENV_TEMPLATE=.env.example"
  )

  if not "%ENV_TEMPLATE%"=="" (
    copy "%ENV_TEMPLATE%" "%ENV_PATH%" >nul
  ) else (
    type nul > "%ENV_PATH%"
  )
)

REM Ensure .gitignore contains .env (avoid accidental commit)
if exist ".gitignore" (
  findstr /x /c:".env" ".gitignore" >nul 2>nul
  if errorlevel 1 echo .env>>".gitignore"
)

REM Keep POSTGRES_USER=postgres because your compose healthcheck uses -U postgres.
call :ensure_kv POSTGRES_USER postgres
call :ensure_kv POSTGRES_DB facilita_v2

REM Replace insecure defaults
call :ensure_kv_if_insecure POSTGRES_PASSWORD postgres 24

call :ensure_kv_if_insecure JWT_ACCESS_SECRET facilita-jwt-access-secret-change-me 32
call :ensure_kv_if_insecure JWT_REFRESH_SECRET facilita-jwt-refresh-secret-change-me 32

call :ensure_kv JWT_ACCESS_EXPIRES_IN 15m
call :ensure_kv JWT_REFRESH_EXPIRES_IN 7d

call :ensure_kv SUPERADMIN_EMAIL superadmin@facilita.local
call :ensure_kv SUPERADMIN_NAME "Super Admin"
call :ensure_admin_password

REM CORS: default to localhost:80 (adjust to your LAN address if needed)
call :ensure_kv_if_empty CORS_ORIGIN http://localhost:80

call :ensure_kv COOKIE_SECURE false
call :ensure_kv COOKIE_DOMAIN ""
call :ensure_kv NEXT_PUBLIC_API_URL /api
call :ensure_kv NGINX_PORT 80

exit /b

:read_kv
REM Reads the first occurrence of KEY from .env into ENV_CUR (may be empty)
set "ENV_CUR="
for /f "usebackq tokens=1,* delims==" %%A in (`findstr /b /c:"%~1=" "%ENV_PATH%"`) do (
  set "ENV_CUR=%%B"
  goto :read_kv_done
)
:read_kv_done
exit /b

:ensure_kv
REM Ensure KEY exists; if missing, set to DEFAULT
call :read_kv "%~1"
if "%ENV_CUR%"=="" (
  set "ENV_KEY=%~1"
  set "ENV_VALUE=%~2"
  call :set_env
)
exit /b

:ensure_kv_if_empty
REM If KEY missing or empty, set to DEFAULT
call :read_kv "%~1"
if "%ENV_CUR%"=="" (
  set "ENV_KEY=%~1"
  set "ENV_VALUE=%~2"
  call :set_env
)
exit /b

:ensure_kv_if_insecure
REM If KEY missing or equals INSECURE_VALUE, generate random hex with BYTES and set it.
REM Args: KEY INSECURE_VALUE BYTES
call :read_kv "%~1"
if "%ENV_CUR%"=="" goto :gen_insecure
if /i "%ENV_CUR%"=="%~2" goto :gen_insecure
goto :eof

:gen_insecure
set "ENV_KEY=%~1"
for /f "usebackq delims=" %%A in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$bytes=New-Object byte[] %~3; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes); ($bytes | ForEach-Object { $_.ToString('x2') }) -join ''"`) do set "ENV_VALUE=%%A"
call :set_env
exit /b

:ensure_admin_password
REM If SUPERADMIN_PASSWORD missing or equals ChangeMe123!, set a URL-safe random password.
call :read_kv SUPERADMIN_PASSWORD
if "%ENV_CUR%"=="" goto :gen_admin
if /i "%ENV_CUR%"=="ChangeMe123!" goto :gen_admin
exit /b

:gen_admin
set "ENV_KEY=SUPERADMIN_PASSWORD"
for /f "usebackq delims=" %%A in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$bytes=New-Object byte[] 24; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes); $s=[Convert]::ToBase64String($bytes).TrimEnd('='); $s=$s.Replace('+','-').Replace('/','_'); $s=($s + 'A1'); $s"`) do set "ENV_VALUE=%%A"
call :set_env
exit /b

:set_env
REM Robustly set/replace KEY=VALUE in .env (single occurrence).
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$path=$env:ENV_PATH; $key=$env:ENV_KEY; $value=$env:ENV_VALUE; " ^
  + "if (-not (Test-Path $path)) { New-Item -ItemType File -Path $path -Force | Out-Null }; " ^
  + "$content=Get-Content -Raw -ErrorAction SilentlyContinue $path; if ($null -eq $content) { $content='' }; " ^
  + "$nl=[Environment]::NewLine; " ^
  + "$lines = $content -split '\r?\n'; " ^
  + "$out = New-Object System.Collections.Generic.List[string]; " ^
  + "$found=$false; " ^
  + "foreach($line in $lines){ if($line -match ('^' + [regex]::Escape($key) + '=')){ if(-not $found){ $out.Add($key + '=' + $value); $found=$true } } elseif($line -ne ''){ $out.Add($line) } }; " ^
  + "if(-not $found){ $out.Add($key + '=' + $value) }; " ^
  + "Set-Content -Encoding ascii -Path $path -Value ($out -join $nl)"
exit /b

:print_access
REM Reads NGINX_PORT from .env and prints access URL
call :read_kv NGINX_PORT
if "%ENV_CUR%"=="" set "ENV_CUR=80"
echo Access (local): http://localhost:%ENV_CUR%/
echo.
echo To view saved secrets in .env:
echo   findstr /b /c:"SUPERADMIN_EMAIL=" .env
echo   findstr /b /c:"SUPERADMIN_PASSWORD=" .env
echo   findstr /b /c:"POSTGRES_PASSWORD=" .env
echo   findstr /b /c:"JWT_ACCESS_SECRET=" .env
echo   findstr /b /c:"JWT_REFRESH_SECRET=" .env
exit /b

:end
endlocal
