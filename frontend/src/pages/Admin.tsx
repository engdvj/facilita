import { useEffect } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Link2, Folder, Palette } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '../components/Header'

export default function Admin() {
  const navigate = useNavigate()

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true'
    if (!loggedIn) {
      navigate('/admin/login')
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <motion.nav
        className="bg-slate-800 py-4 flex justify-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Link to="/admin/links" className="hover:underline flex items-center gap-1">
          <Link2 size={18} /> Links
        </Link>
        <Link to="/admin/categories" className="hover:underline flex items-center gap-1">
          <Folder size={18} /> Categorias
        </Link>
        <Link to="/admin/colors" className="hover:underline flex items-center gap-1">
          <Palette size={18} /> Cores
        </Link>
      </motion.nav>
      <div className="p-4 container mx-auto">
        <Outlet />
      </div>
    </div>
  )
}

