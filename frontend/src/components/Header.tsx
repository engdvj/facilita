import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Home, Shield, LogOut, Menu, X, Palette } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import api from '../api'

interface HeaderProps {
  onMenuClick?: () => void
  sidebarOpen?: boolean
}

const defaultTheme = {
  '--background-main': '#f3f4f6',
  '--text-color': '#111827',
  '--link-bar-background': '#4f46e5',
  '--link-bar-text': '#ffffff',
  '--button-primary': '#6366f1',
  '--hover-effect': '#4338ca',
  '--card-background': '#1c2233',
  '--accent-color': '#7c3aed'
}

export default function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  const [loggedIn, setLoggedIn] = useState(false)
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState(defaultTheme)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setLoggedIn(localStorage.getItem('loggedIn') === 'true')
  }, [])

  const openModal = () => {
    const styles = getComputedStyle(document.documentElement)
    const current: Record<string, string> = {}
    Object.keys(defaultTheme).forEach((k) => {
      current[k] = styles.getPropertyValue(k).trim()
    })
    setTheme(current)
    setOpen(true)
  }

  const applyTheme = (t: Record<string, string>) => {
    Object.entries(t).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v)
    })
  }

  const saveTheme = () => {
    applyTheme(theme)
    localStorage.setItem('theme-custom', JSON.stringify(theme))
    setOpen(false)
  }

  const resetTheme = () => {
    applyTheme(defaultTheme)
    localStorage.removeItem('theme-custom')
    setTheme(defaultTheme)
  }

  const logout = async () => {
    await api.post('/auth/logout')
    localStorage.removeItem('loggedIn')
    setLoggedIn(false)
    navigate('/admin/login')
  }

  return (
    <motion.header
      className="shadow-md"
      style={{ backgroundColor: 'var(--link-bar-background)', color: 'var(--link-bar-text)' }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-full p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <button onClick={onMenuClick} className="hover:bg-[var(--hover-effect)] p-1 rounded">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          <Link
            to="/"
            className="text-xl sm:text-2xl font-heading font-bold whitespace-nowrap"
          >
            FACILITA CHVC
          </Link>
        </div>
        <nav className="space-x-4 flex items-center">
          <Link to="/" className="hover:underline flex items-center gap-1">
            <Home size={18} />
            Início
          </Link>
          <Link
            to={loggedIn ? '/admin' : '/admin/login'}
            className="hover:underline flex items-center gap-1"
          >
            <Shield size={18} />
            Admin
          </Link>
          {loggedIn && (
            <button onClick={logout} className="hover:underline flex items-center gap-1">
              <LogOut size={18} /> Sair
            </button>
          )}
          {loggedIn && (
            <button onClick={openModal} className="ml-2 hover:bg-[var(--hover-effect)] p-1 rounded">
              <Palette size={18} />
            </button>
          )}
        </nav>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl text-gray-900 space-y-4 overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-semibold mb-2">Personalizar Aparência</h2>
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
                    '--hover-effect'
                  ]
                }
              ]
              if (location.pathname.startsWith('/admin')) {
                groups.push({
                  label: 'Admin',
                  vars: ['--card-background', '--accent-color']
                })
              }
              return groups.map((g) => (
                <div key={g.label} className="border-t pt-4 first:border-t-0 first:pt-0">
                  <h3 className="font-semibold mb-2 text-sm">{g.label}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {g.vars.map((key) => (
                      <label key={key} className="flex items-center gap-2">
                        <span className="flex-1 text-xs md:text-sm">{key.replace('--', '')}</span>
                        <input
                          type="color"
                          value={theme[key]}
                          onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                        />
                        <span className="w-5 h-5 border rounded" style={{ backgroundColor: theme[key] }} />
                      </label>
                    ))}
                  </div>
                </div>
              ))
            })()}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={resetTheme} className="px-3 py-1 rounded border">Resetar para padrão</button>
              <button onClick={() => setOpen(false)} className="px-3 py-1 rounded border">Cancelar</button>
              <button onClick={saveTheme} className="btn-primary px-3 py-1 rounded">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </motion.header>
  )
}
