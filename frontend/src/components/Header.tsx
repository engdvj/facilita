import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  LogIn,
  LogOut,
  Menu,
  X,
  Palette,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'
import EnhancedThemeSelector from './ui/EnhancedThemeSelector'

interface HeaderProps {
  onMenuClick?: () => void
  sidebarOpen?: boolean
  /**
   * When true the header stays visible while scrolling with reduced opacity
   * and becomes fully opaque on hover.
   */
  sticky?: boolean
}

export default function Header({ onMenuClick, sidebarOpen, sticky = false }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthenticated, logout: authLogout } = useAuth()

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
    authLogout()
    navigate('/login')
  }

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */
  return (
    <motion.header
      className={`shadow-md ${
        sticky ? 'sticky top-0 z-30 opacity-60 hover:opacity-100 transition-opacity' : ''
      }`}
      style={{
        backgroundColor: 'var(--header-background)',
        color: 'var(--header-text)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)'
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-full p-4 flex justify-between items-center">
        {/* Lado esquerdo */}
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                color: 'var(--header-text)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          <Link
            to="/"
            className="text-lg sm:text-2xl font-bold whitespace-nowrap"
            style={{ color: 'var(--header-text)' }}
          >
            FACILITA CHVC
          </Link>
        </div>

        {/* Navegação */}
        <nav className="space-x-4 flex items-center">
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="hover:underline flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
              style={{ 
                color: 'var(--header-text)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <LogIn size={18} />
              Login
            </Link>
          ) : (
            <>
              {user && (
                <span className="text-sm opacity-80" style={{ color: 'var(--header-text)' }}>
                  Olá, {user.username}
                </span>
              )}

              <button
                onClick={() => setOpen(true)}
                className="p-2 rounded-lg transition-colors hover:scale-105"
                style={{ 
                  color: 'var(--header-text)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
                title="Personalizar tema"
              >
                <Palette size={18} />
              </button>

              <button
                onClick={logout}
                className="hover:underline flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                style={{ 
                  color: 'var(--header-text)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <LogOut size={18} /> Sair
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Modal de personalização */}
      {open && (
        <div
          className="overflow-y-auto"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '2rem 1rem'
          }}
        >
          <motion.div
            className="w-full rounded-2xl border shadow-2xl"
            style={{
              maxWidth: '80rem',
              minHeight: 'fit-content',
              backgroundColor: 'var(--background-card)',
              borderColor: 'var(--border-primary)',
              backdropFilter: 'blur(20px)',
              padding: '2rem',
              marginTop: '2rem',
              marginBottom: '2rem'
            }}
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Palette size={24} style={{ color: 'var(--text-accent)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Personalizar Aparência
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg transition-colors hover:scale-105"
                style={{
                  color: 'var(--text-secondary)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <EnhancedThemeSelector />

            <div className="flex justify-center mt-8">
              <button
                onClick={() => setOpen(false)}
                className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: 'var(--button-primary)',
                  color: 'white'
                }}
              >
                Pronto
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.header>
  )
}
