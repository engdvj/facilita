import { useState } from 'react'
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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      <Header />
      <motion.form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-6 rounded-lg flex flex-col gap-4 w-80"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <input
          className="p-2 rounded"
          placeholder="Usuário"
          value={username}
          onChange={(e: any) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="p-2 rounded"
          placeholder="Senha"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-colors text-white py-2 rounded-md flex items-center justify-center gap-2">
          <LogIn size={16} />
          Entrar
        </button>
      </motion.form>
    </div>
  )
}
