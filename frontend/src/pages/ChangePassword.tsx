import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { Lock, ArrowRightToLine } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ChangePassword() {
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const loggedIn =
      sessionStorage.getItem('loggedIn') === 'true' ||
      localStorage.getItem('loggedIn') === 'true'
    if (!loggedIn) {
      navigate('/admin/login')
    }
  }, [navigate])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (newPass !== confirm) {
      toast.error('Senhas não conferem')
      return
    }
    try {
      await api.post('/auth/change-password', {
        old_password: oldPass,
        new_password: newPass,
      })
      toast.success('Senha alterada')
      navigate('/admin')
    } catch (err) {
      toast.error('Erro ao alterar senha')
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
          <h1 className="font-heading text-2xl text-white">Alterar Senha</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
            <input
              type="password"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              placeholder="Senha atual"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
            <input
              type="password"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              placeholder="Nova senha"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
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
            Salvar
          </button>
        </form>
      </motion.div>
    </div>
  )
}
