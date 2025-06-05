import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="p-4 bg-slate-800 text-white flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">FACILITA CHVC</Link>
      <nav className="space-x-4">
        <Link to="/" className="hover:underline">Início</Link>
        <Link to="/admin/login" className="hover:underline">Admin</Link>
      </nav>
    </header>
  )
}
