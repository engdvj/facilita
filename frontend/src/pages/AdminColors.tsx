import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import api from '../api'

export default function AdminColors() {
  const [colors, setColors] = useState<{ id: number; value: string }[]>([])
  const [newColor, setNewColor] = useState('#ffffff')

  useEffect(() => {
    fetchColors()
  }, [])

  const fetchColors = async () => {
    const res = await api.get('/colors')
    setColors(res.data)
  }

  const handleCreate = async (e: any) => {
    e.preventDefault()
    try {
      await api.post('/colors', { value: newColor })
      await fetchColors()
      setNewColor('#ffffff')
      toast.success('Cor criada')
    } catch {
      toast.error('Erro ao criar cor')
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-xl font-heading">Cores</h2>
      <form onSubmit={handleCreate} className="flex items-center gap-2 bg-slate-800 p-4 rounded">
        <input
          type="color"
          value={newColor}
          onChange={e => setNewColor(e.target.value)}
          className="w-20 h-10 p-0 border rounded"
        />
        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-colors px-4 py-2 rounded text-white">Adicionar</button>
      </form>
      <motion.ul className="list-disc pl-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {colors.map(c => (
          <motion.li key={c.id} layout>{c.value}</motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
