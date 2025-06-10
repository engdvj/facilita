import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { User, Lock, ArrowRightToLine } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [remember, setRemember] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const loggedIn =
      sessionStorage.getItem('loggedIn') === 'true' ||
      localStorage.getItem('loggedIn') === 'true'
    if (loggedIn) {
      navigate('/admin')
    }
  }, [navigate])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      await api.post('/auth/login', { username, password })
      sessionStorage.setItem('loggedIn', 'true')
      if (remember) {
        localStorage.setItem('loggedIn', 'true')
      } else {
        localStorage.removeItem('loggedIn')
      }
      toast.success('Login realizado')
      navigate('/admin')
    } catch (err) {
      setError('Credenciais inválidas')
      toast.error('Credenciais inválidas')
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1e2e] via-[#1a143d] to-[#0c0c1c]">
      <div className="absolute inset-0 bg-black/40" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm rounded-2xl backdrop-blur-md bg-white/5 border border-purple-500/30 shadow-xl p-6"
      >
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl text-white">FACILITA CHVC</h1>
          <p className="text-sm text-gray-300">sua central de acessos</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 italic mt-1">
              {error}
            </motion.p>
          )}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md hover:scale-105 transition"
          >
            <ArrowRightToLine size={18} />
            Entrar
          </button>
          <div className="flex items-center justify-between text-xs text-gray-300">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded bg-gray-700 border-gray-600"
              />
              Lembrar login
            </label>
            <a href="/change-password" className="hover:underline">
              Esqueceu a senha?
            </a>
          </div>
          <div className="text-center text-xs mt-2">
            <a href="/" className="hover:underline">
              Voltar ao início
            </a>

          </div>
        </form>
        <footer className="mt-6 text-center text-xs text-gray-400">Versão 1.0.0</footer>
      </motion.div>
    </div>
  )
}
