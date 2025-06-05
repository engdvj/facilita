import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api'
import Header from '../components/Header'

export default function Admin() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/admin/login')
      return
    }
    api
      .get('/links', { headers: { Authorization: `Bearer ${token}` } })
      .catch(() => {
        toast.error('Sessão expirada')
        navigate('/admin/login')
      })
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      <Header />
      <div className="p-4 max-w-5xl mx-auto">
        <h2 className="text-2xl mb-4">Painel Administrativo</h2>
        <p>Em desenvolvimento...</p>
      </div>
    </div>
  )
}
