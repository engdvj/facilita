import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import Header from '../components/Header'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      const res = await api.post('/auth/login', { username, password })
      localStorage.setItem('token', res.data.access_token)
      toast.success('Login realizado')
      navigate('/admin')
    } catch (err) {
      toast.error('Credenciais inválidas')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="bg-slate-800/70 backdrop-blur p-8 rounded-lg flex flex-col gap-4 w-full max-w-sm shadow-xl">
          <input
          className="p-2 rounded text-black"
          placeholder="Usuário"
          value={username}
          onChange={(e: any) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="p-2 rounded text-black"
          placeholder="Senha"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-primary text-white py-2 rounded-md hover:bg-primary/80">Entrar</button>
      </form>
      </div>
    </div>
  )
}
