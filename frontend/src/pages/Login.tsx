import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '../components/Header'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true'
    if (loggedIn) {
      navigate('/admin')
    }
  }, [navigate])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      await api.post('/auth/login', { username, password })
      localStorage.setItem('loggedIn', 'true')
      toast.success('Login realizado')
      navigate('/admin')
    } catch (err) {
      toast.error('Credenciais inválidas')
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--background-main)', color: 'var(--text-color)' }}
    >
      <Header />
      <div className="flex-1 flex items-center justify-center py-8">
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-800 p-6 rounded-lg flex flex-col gap-4 w-80 text-gray-900 dark:text-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <input
            className="p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-700"
            placeholder="Usuário"
            value={username}
            onChange={(e: any) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-700"
            placeholder="Senha"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary py-2 rounded-md flex items-center justify-center gap-2"
          >
            <LogIn size={16} />
            Entrar
          </button>
        </motion.form>
      </div>
    </div>
  )
}
