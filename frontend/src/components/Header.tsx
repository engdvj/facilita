import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  LogIn,
  LogOut,
  Menu,
  X,
  Palette,
  Search,
  ChevronDown,
  Grid3x3,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'
import EnhancedThemeSelector from './ui/EnhancedThemeSelector'
import Modal from './ui/Modal'

interface Category {
  id: number
  name: string
  color?: string
  icon?: string
}

interface HeaderProps {
  onMenuClick?: () => void
  sidebarOpen?: boolean
  /**
   * When true the header stays visible while scrolling with reduced opacity
   * and becomes fully opaque on hover.
   */
  sticky?: boolean
  search?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
  categories?: Category[]
  selectedCategory?: number | 'all'
  onCategoryChange?: (categoryId: number | 'all') => void
}

export default function Header({ onMenuClick, sidebarOpen, sticky = false, search = '', onSearchChange, showSearch = false, categories = [], selectedCategory = 'all', onCategoryChange }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
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

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (dropdownOpen && !target.closest('.category-dropdown')) {
        setDropdownOpen(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [dropdownOpen])

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
            FACILITA
          </Link>
        </div>

        {/* Barra de busca centralizada */}
        {showSearch && (
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 bg-white/90 backdrop-blur-sm text-black text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* Dropdown de Categorias */}
        {showSearch && categories.length > 0 && (
          <div className="relative category-dropdown">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border border-gray-300/50 bg-white/90 hover:bg-white text-gray-700 font-medium"
            >
              <Grid3x3 size={16} />
              <span className="hidden sm:inline">
                {selectedCategory === 'all' ? 'Todas' : categories.find(c => c.id === selectedCategory)?.name || 'Categoria'}
              </span>
              <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    onCategoryChange?.('all')
                    setDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 ${
                    selectedCategory === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="font-medium">Todas as categorias</span>
                </button>
                
                <div className="border-t border-gray-100 my-2"></div>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      onCategoryChange?.(category.id)
                      setDropdownOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 ${
                      selectedCategory === category.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color || '#6b7280' }}
                    ></div>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

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

      {/* Modal de personalização de tema */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Personalizar Aparência"
        size="lg"
        className="theme-modal"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette size={24} style={{ color: 'var(--text-accent)' }} />
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Escolha o tema que mais combina com você
            </p>
          </div>
          
          <EnhancedThemeSelector />
          
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setOpen(false)}
              className="px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg"
              style={{
                backgroundColor: 'var(--button-primary)',
                color: 'white'
              }}
            >
              Concluído
            </button>
          </div>
        </div>
      </Modal>
    </motion.header>
  )
}
