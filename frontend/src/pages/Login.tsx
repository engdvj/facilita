import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
      api.get('/auth/me').then(({ data }) => {
        navigate(data.isAdmin ? '/admin' : '/user/links')
      })
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
      const me = await api.get('/auth/me')
      try {
        const { data } = await api.get('/theme')
        if (data.theme) {
          Object.entries(data.theme).forEach(([k, v]) => {
            document.documentElement.style.setProperty(k, v as string)
          })
          localStorage.setItem('theme-custom', JSON.stringify(data.theme))
        }
      } catch {}
      toast.success('Login realizado')
      navigate(me.data.isAdmin ? '/admin' : '/user/links')
    } catch (err) {
      setError('Credenciais inválidas')
      toast.error('Credenciais inválidas')
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
          <h1 className="font-heading text-2xl text-white">FACILITA CHVC</h1>
          <p className="text-sm text-white/70">sua central de acessos</p>
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
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 italic mt-1">
              {error}
            </motion.p>
          )}
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 py-2 rounded-xl"
          >
            <ArrowRightToLine size={18} />
            Entrar
          </button>
          <div className="flex items-center justify-between text-xs text-white/70">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded bg-white/10 border-white/20"
              />
              Lembrar login
            </label>
            <Link to="/change-password" className="hover:underline">
              Esqueceu a senha?
            </Link>

          </div>
          <div className="text-center text-xs mt-2">
            <a href="/" className="hover:underline">
              Voltar ao início
            </a>

          </div>
        </form>
        <footer className="mt-6 text-center text-xs text-white/50">Versão 1.0.0</footer>
      </motion.div>
    </div>
  )
}
