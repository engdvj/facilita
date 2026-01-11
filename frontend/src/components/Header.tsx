import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  LogIn,
  LogOut,
  Menu,
  X,
  Palette,
  Moon,
  Sun,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import api from '../api'

interface HeaderProps {
  onMenuClick?: () => void
  sidebarOpen?: boolean
  /**
   * When true the header stays visible while scrolling with reduced opacity
   * and becomes fully opaque on hover.
   */
  sticky?: boolean
}

const defaultTheme: Record<string, string> = {
  '--background-main': '#f6efe6',
  '--text-color': '#1c2533',
  '--link-bar-background': '#0f3d3e',
  '--link-bar-text': '#f8fafc',
  '--button-primary': '#f97316',
  '--hover-effect': '#155e63',
  '--card-background': '#0f172a',
  '--accent-color': '#fbbf24',
  '--input-background': '#0b1220',
  '--page-gradient':
    'radial-gradient(1200px 600px at 10% -10%, rgba(15, 61, 62, 0.22), transparent 60%), radial-gradient(800px 500px at 90% 0%, rgba(249, 115, 22, 0.18), transparent 55%), radial-gradient(700px 500px at 50% 120%, rgba(251, 191, 36, 0.16), transparent 60%)',
  '--surface-border': 'rgba(255, 255, 255, 0.08)',
  '--surface-highlight': 'rgba(255, 255, 255, 0.14)',
  '--panel-shadow': '0 28px 60px rgba(15, 23, 42, 0.35)',
  '--card-shadow': '0 18px 36px rgba(15, 23, 42, 0.3)',
}

const darkTheme: Record<string, string> = {
  '--background-main': '#0b0f17',
  '--text-color': '#e2e8f0',
  '--link-bar-background': '#0b1f2a',
  '--link-bar-text': '#f8fafc',
  '--button-primary': '#f97316',
  '--hover-effect': '#114055',
  '--card-background': '#0f172a',
  '--accent-color': '#fbbf24',
  '--input-background': '#111827',
  '--page-gradient':
    'radial-gradient(1200px 600px at 10% -10%, rgba(14, 116, 144, 0.25), transparent 60%), radial-gradient(800px 500px at 90% 0%, rgba(249, 115, 22, 0.22), transparent 55%), radial-gradient(700px 500px at 50% 120%, rgba(251, 191, 36, 0.18), transparent 60%)',
  '--surface-border': 'rgba(255, 255, 255, 0.06)',
  '--surface-highlight': 'rgba(255, 255, 255, 0.12)',
  '--panel-shadow': '0 28px 60px rgba(0, 0, 0, 0.5)',
  '--card-shadow': '0 18px 36px rgba(0, 0, 0, 0.55)',
}

const themeModeKey = 'theme-mode'
const themeLightKey = 'theme-light'

const captureTheme = () => {
  const styles = getComputedStyle(document.documentElement)
  const current: Record<string, string> = {}
  Object.keys(defaultTheme).forEach((key) => {
    const value = styles.getPropertyValue(key).trim()
    current[key] = value || defaultTheme[key]
  })
  return current
}

const parseTheme = (value: string | null) => {
  if (!value) return null
  try {
    return JSON.parse(value) as Record<string, string>
  } catch {
    return null
  }
}

export default function Header({ onMenuClick, sidebarOpen, sticky = false }: HeaderProps) {
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState<{ username: string; isAdmin: boolean } | null>(null)
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState(defaultTheme)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    localStorage.getItem(themeModeKey) === 'dark' ? 'dark' : 'light',
  )
  const [themeName, setThemeName] = useState('')
  const [savedThemes, setSavedThemes] = useState<
    { name: string; vars: Record<string, string> }[]
  >([])

  const navigate = useNavigate()
  const location = useLocation()

  /* ---------------------------------------------------------------- */
  /* Auth & tema persistido                                            */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const loggedIn =
      sessionStorage.getItem('loggedIn') === 'true' ||
      localStorage.getItem('loggedIn') === 'true'
    setLoggedIn(loggedIn)
    if (loggedIn) {
      api
        .get('/auth/me')
        .then(({ data }) => setUser(data))
        .catch(() => setUser(null))
    }
  }, [])

  const openModal = () => {
    /* captura cores atuais do :root */
    setTheme(captureTheme())
    const savedName = localStorage.getItem('theme-name')
    setThemeName(savedName || '')
    const stored = localStorage.getItem('saved-themes')
    if (stored) {
      try {
        setSavedThemes(JSON.parse(stored))
      } catch {
        setSavedThemes([])
      }
    } else {
      setSavedThemes([])
    }

    setOpen(true)
  }

  const applyTheme = (t: Record<string, string>) => {
    Object.entries(t).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v),
    )
  }

  const persistTheme = (nextTheme: Record<string, string>, mode: 'light' | 'dark') => {
    applyTheme(nextTheme)
    localStorage.setItem('theme-custom', JSON.stringify(nextTheme))
    localStorage.setItem(themeModeKey, mode)
    setThemeMode(mode)
    api.post('/theme', { theme: nextTheme }).catch(() => {})
  }

  const toggleTheme = () => {
    if (themeMode === 'dark') {
      const storedLight = parseTheme(localStorage.getItem(themeLightKey))
      const nextTheme = storedLight || defaultTheme
      persistTheme(nextTheme, 'light')
      setTheme(nextTheme)
      return
    }

    const currentTheme = captureTheme()
    localStorage.setItem(themeLightKey, JSON.stringify(currentTheme))
    persistTheme(darkTheme, 'dark')
    setTheme(darkTheme)
  }

  const saveTheme = () => {
    applyTheme(theme)
    localStorage.setItem('theme-custom', JSON.stringify(theme))
    localStorage.setItem(themeModeKey, themeMode)
    if (themeMode === 'light') {
      localStorage.setItem(themeLightKey, JSON.stringify(theme))
    }
    if (themeName) {
      localStorage.setItem('theme-name', themeName)
      const list = [...savedThemes]
      const idx = list.findIndex((t) => t.name === themeName)
      if (idx >= 0) {
        list[idx].vars = theme
      } else {
        list.push({ name: themeName, vars: theme })
      }
      setSavedThemes(list)
      localStorage.setItem('saved-themes', JSON.stringify(list))

    } else {
      localStorage.removeItem('theme-name')
    }
    api.post('/theme', { theme }).catch(() => {})
    setOpen(false)
  }

  const resetTheme = () => {
    applyTheme(defaultTheme)
    localStorage.removeItem('theme-custom')
    localStorage.removeItem('theme-name')
    localStorage.setItem(themeModeKey, 'light')
    localStorage.setItem(themeLightKey, JSON.stringify(defaultTheme))
    setThemeMode('light')
    setThemeName('')
    setTheme(defaultTheme)
    api.post('/theme', { theme: null }).catch(() => {})
  }

  const logout = async () => {
    await api.post('/auth/logout')
    sessionStorage.removeItem('loggedIn')
    localStorage.removeItem('loggedIn')
    try {
      const { data } = await api.get('/theme')
      if (data.theme) {
        applyTheme(data.theme)
        localStorage.setItem('theme-custom', JSON.stringify(data.theme))
      } else {
        applyTheme(defaultTheme)
        localStorage.removeItem('theme-custom')
        localStorage.removeItem('theme-name')
        localStorage.setItem(themeModeKey, 'light')
        localStorage.setItem(themeLightKey, JSON.stringify(defaultTheme))
        setThemeMode('light')
      }
    } catch {}
    setLoggedIn(false)
    setUser(null)
    navigate('/admin/login')
  }

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */
  return (
    <motion.header
      className={`border-b border-white/10 shadow-[0_18px_40px_rgba(15,23,42,0.35)] ${
        sticky ? 'sticky top-0 z-30 opacity-70 hover:opacity-100 transition-opacity' : ''
      }`}
      style={{
        backgroundImage:
          'linear-gradient(120deg, var(--link-bar-background), var(--hover-effect))',
        color: 'var(--link-bar-text)',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-full px-4 py-4 flex justify-between items-center">
        {/* Lado esquerdo */}
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="rounded-full border border-white/20 bg-white/10 p-2 transition hover:bg-white/20"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          <Link
            to="/"
            className="text-lg sm:text-2xl font-heading font-bold tracking-wide whitespace-nowrap"
          >
            FACILITA CHVC
          </Link>
        </div>

        {/* Navegação */}
        <nav className="space-x-3 flex items-center">
          <button
            onClick={toggleTheme}
            className="nav-pill text-sm font-semibold"
            aria-label={themeMode === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            title={themeMode === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {themeMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="hidden sm:inline">
              {themeMode === 'dark' ? 'Claro' : 'Escuro'}
            </span>
          </button>
          {!loggedIn ? (
            <Link
              to="/admin/login"
              className="nav-pill text-sm font-semibold"
            >
              <LogIn size={18} />
              Login
            </Link>
          ) : (
            <>
              {user && (
                <span className="hidden sm:inline text-xs uppercase tracking-[0.2em] opacity-70">
                  {user.username}
                </span>
              )}

              <button
                onClick={logout}
                className="nav-pill text-sm font-semibold"
              >
                <LogOut size={18} /> Sair
              </button>

              <button
                onClick={openModal}
                className="rounded-full border border-white/20 bg-white/10 p-2 transition hover:bg-white/20"
              >
                <Palette size={18} />
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Modal de personalização */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 p-6 rounded-2xl shadow-2xl w-full max-w-xl space-y-4 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold text-center mb-4 flex items-center justify-center gap-2">
              <Palette size={20} /> Personalizar Aparência
            </h2>

            <div className="flex items-center justify-between gap-4">
              <label className="text-sm text-gray-700 dark:text-gray-300 w-40">Nome do Tema</label>
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="Opcional"
                className="flex-1 px-2 py-1 border rounded"
              />
            </div>

            {savedThemes.length > 0 && (
              <div>
                <h3 className="text-xs uppercase text-gray-500 mt-4 border-b pb-2">
                  Temas Salvos
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {savedThemes.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => {
                        setTheme(t.vars)
                        setThemeName(t.name)
                      }}
                      className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* grupos de variáveis */}
            {(() => {
              const groups: { label: string; vars: string[] }[] = [
                {
                  label: 'Geral',
                  vars: [
                    '--background-main',
                    '--text-color',
                    '--link-bar-background',
                    '--link-bar-text',
                    '--button-primary',
                    '--hover-effect',
                  ],
                },
              ]

              if (location.pathname.startsWith('/admin')) {
                groups.push({
                  label: 'Admin',
                  vars: ['--card-background', '--accent-color', '--input-background'],
                })
              }

              return groups.map((g) => (
                <div key={g.label} className="border-t pt-4 first:border-t-0 first:pt-0">
                  <h3 className="text-xs uppercase text-gray-500 mt-6 border-b pb-2">
                    {g.label}
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    {g.vars.map((key) => (
                      <div key={key} className="flex items-center justify-between gap-4">
                        <label className="text-sm text-gray-700 dark:text-gray-300 w-40">
                          {key.replace('--', '')}
                        </label>
                        <input
                          type="color"
                          value={theme[key]}
                          onChange={(e) =>
                            setTheme({ ...theme, [key]: e.target.value })
                          }
                          className="h-8 w-12 rounded border"
                          title={theme[key]}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            })()}

            <div className="mt-4 flex justify-center">
              <div className="w-32 border rounded-md overflow-hidden text-xs">
                <div
                  style={{
                    backgroundColor: theme['--link-bar-background'],
                    color: theme['--link-bar-text'],
                  }}
                  className="h-6 flex items-center justify-center"
                >
                  Barra
                </div>
                <div
                  style={{ backgroundColor: theme['--background-main'] }}
                  className="h-16 flex items-center justify-center"
                >
                  <div
                    style={{ backgroundColor: theme['--button-primary'] }}
                    className="w-12 h-4 rounded"
                  />
                </div>
              </div>
            </div>

            {/* ações */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={resetTheme}
                className="text-sm px-3 py-1.5 border rounded hover:bg-gray-100"
              >
                Resetar
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-sm px-3 py-1.5 border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={saveTheme}
                className="btn-primary px-4 py-2 rounded-xl"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.header>
  )
}
