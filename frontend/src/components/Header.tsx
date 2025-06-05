import { Link } from 'react-router-dom'
import { Home, LogIn } from 'lucide-react'

export default function Header() {
  return (
    <header className="p-4 bg-gradient-to-r from-primary to-secondary text-white flex justify-between items-center shadow-md">
      <Link to="/" className="text-2xl font-bold">FACILITA CHVC</Link>
      <nav className="flex gap-4">
        <Link to="/" className="flex items-center gap-1 hover:underline">
          <Home size={18} /> Início
        </Link>
        <Link to="/admin/login" className="flex items-center gap-1 hover:underline">
          <LogIn size={18} /> Admin
        </Link>
      </nav>
    </header>
  )
}
