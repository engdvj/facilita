import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-700 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">FACILITA CHVC</h1>
        <p className="text-lg">Sua central de acessos</p>
        <Link
          to="/login"
          className="inline-block bg-white text-purple-700 px-4 py-2 rounded font-semibold shadow"
        >
          Entrar
        </Link>
      </div>
    </div>
  )
}
