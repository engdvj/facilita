import { useEffect } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
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
      <nav className="bg-slate-800 p-4 space-x-4">
        <Link to="/admin/links" className="hover:underline">Links</Link>
        <Link to="/admin/categories" className="hover:underline">Categorias</Link>
        <Link to="/admin/colors" className="hover:underline">Cores</Link>
      </nav>
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  )
}

