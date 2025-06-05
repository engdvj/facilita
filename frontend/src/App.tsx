import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

function Home() {
  const [message, setMessage] = useState('')
  useEffect(() => {
    axios.get('/api/ping').then((res) => setMessage(res.data.message))
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">FACILITA CHVC</h1>
      <p>Backend status: {message}</p>
      <Link to="/admin/login" className="text-blue-400">Admin Login</Link>
    </div>
  )
}

function Login() {
  return <div className="p-4">Login Placeholder</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}
