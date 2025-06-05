import { Link } from 'react-router-dom'
import { Home, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header() {
  return (
    <motion.header
      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-heading font-bold">FACILITA CHVC</Link>
        <nav className="space-x-4 flex items-center">
          <Link to="/" className="hover:underline flex items-center gap-1">
            <Home size={18} />
            Início
          </Link>
          <Link to="/admin/login" className="hover:underline flex items-center gap-1">
            <Shield size={18} />
            Admin
          </Link>
        </nav>
      </div>
    </motion.header>
  )
}
