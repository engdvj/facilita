@echo off
setlocal EnableExtensions DisableDelayedExpansion

:: Facilita V2 - Init Script (Windows)

cd /d "%~dp0"

echo ========================================
echo    FACILITA V2 - Initial Setup
echo ========================================

set "ENV_PATH=%CD%\.env"
set "ENV_TEMPLATE=.env.production"

if not exist "%ENV_TEMPLATE%" (
    if exist ".env.example" (
        set "ENV_TEMPLATE=.env.example"
    ) else (
        echo No .env template found. Expected .env.production or .env.example.
        exit /b 1
    )
)

if not exist "%ENV_PATH%" (
    echo Creating .env from %ENV_TEMPLATE%...
    copy "%ENV_TEMPLATE%" "%ENV_PATH%" >nul
) else (
    echo Using existing .env.
)

:: Create necessary directories
echo Ensuring directories...
if not exist "backend\uploads\images" mkdir "backend\uploads\images"
if not exist "backend\uploads\documents" mkdir "backend\uploads\documents"
if not exist "backend\backups\auto" mkdir "backend\backups\auto"
if not exist "backend\backups\tmp" mkdir "backend\backups\tmp"

echo.
set "GEN_JWT="
set /p GEN_JWT=Generate new JWT secrets now? (Y/n):
if /i "%GEN_JWT%"=="n" goto :skip_jwt
call :generate_secret JWT_ACCESS_SECRET
call :generate_secret JWT_REFRESH_SECRET
echo JWT secrets updated.

:skip_jwt
echo.
echo Configure .env values (press Enter to keep current)
call :prompt_set POSTGRES_USER "Postgres user"
call :prompt_set POSTGRES_PASSWORD "Postgres password"
call :prompt_set POSTGRES_DB "Postgres database"
call :prompt_set SUPERADMIN_EMAIL "Superadmin email"
call :prompt_set SUPERADMIN_PASSWORD "Superadmin password"
call :prompt_set SUPERADMIN_NAME "Superadmin name"
call :prompt_set CORS_ORIGIN "CORS origin"
call :prompt_set COOKIE_SECURE "Cookie secure (true/false)"
call :prompt_set COOKIE_DOMAIN "Cookie domain"
call :prompt_set NEXT_PUBLIC_API_URL "Frontend API URL"
call :prompt_set NGINX_PORT "Nginx port"

echo.
echo Init complete. Review %ENV_PATH% if needed, then run start.bat up.
goto :end

:prompt_set
set "ENV_KEY=%~1"
set "ENV_VALUE="
set /p ENV_VALUE=%~2^:
if not "%ENV_VALUE%"=="" call :set_env
exit /b

:generate_secret
set "ENV_KEY=%~1"
for /f "usebackq delims=" %%A in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$bytes=New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes); ($bytes | ForEach-Object { $_.ToString('x2') }) -join ''"`) do set "ENV_VALUE=%%A"
call :set_env
exit /b

:set_env
powershell -NoProfile -ExecutionPolicy Bypass -Command "$path=$env:ENV_PATH; $key=$env:ENV_KEY; $value=$env:ENV_VALUE; if (-not (Test-Path $path)) { New-Item -ItemType File -Path $path -Force | Out-Null }; $content=Get-Content -Raw -ErrorAction SilentlyContinue $path; if ($null -eq $content) { $content='' }; $nl=[Environment]::NewLine; $pattern='(?m)^' + [regex]::Escape($key) + '='; if ($content -match $pattern) { $content = $content -replace ($pattern + '.*$'), { $key + '=' + $value } } else { if ($content.Length -gt 0 -and -not $content.EndsWith($nl)) { $content += $nl }; $content += $key + '=' + $value + $nl }; Set-Content -NoNewline -Encoding ascii -Path $path -Value $content"
exit /b

:end
endlocal
