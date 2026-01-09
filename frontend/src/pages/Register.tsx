import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { User, Lock, ArrowRightToLine } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Senhas não conferem')
      return
    }
    try {
      await api.post('/auth/register', { username, password })
      toast.success('Usuário criado')
      navigate('/admin/login')
    } catch (err: any) {
      toast.error('Erro ao criar usuário')
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--background-main)', backgroundImage: 'var(--page-gradient)' }}
    >
      <div className="absolute inset-0 bg-black/35" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="app-panel text-white/90 relative z-10 w-full max-w-sm rounded-3xl backdrop-blur-md p-6"
      >
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl text-white">Cadastro</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
            <input
              type="password"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
            <input
              type="password"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              placeholder="Confirmar senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 py-2 rounded-xl"
          >
            <ArrowRightToLine size={18} />
            Cadastrar
          </button>
        </form>
      </motion.div>
    </div>
  )
}
