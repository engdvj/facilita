import { Link, useNavigate } from 'react-router-dom'
import { Home, Shield, Sun, Moon, LogOut, Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import api from '../api'

interface HeaderProps {
  onMenuClick?: () => void
  sidebarOpen?: boolean
}

export default function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  const [theme, setTheme] = useState('light')
  const [loggedIn, setLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light'
    setTheme(saved)
    document.documentElement.classList.toggle('dark', saved === 'dark')
    setLoggedIn(localStorage.getItem('loggedIn') === 'true')
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  const logout = async () => {
    await api.post('/auth/logout')
    localStorage.removeItem('loggedIn')
    setLoggedIn(false)
    navigate('/admin/login')
  }

  return (
    <motion.header
      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-full p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <button onClick={onMenuClick}>
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
          <button onClick={toggleTheme} className="ml-2">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </motion.header>
  )
}
