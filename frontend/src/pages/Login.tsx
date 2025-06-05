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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      <Header />
      <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg flex flex-col gap-4 w-80">
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
        <button type="submit" className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Entrar</button>
      </form>
    </div>
  )
}
