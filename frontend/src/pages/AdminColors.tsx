import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
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
    <div className="space-y-6">
      <h2 className="text-xl">Cores</h2>
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <input
          type="color"
          value={newColor}
          onChange={e => setNewColor(e.target.value)}
          className="w-20 h-10 p-0 border rounded"
        />
        <button className="bg-blue-600 px-4 py-2 rounded">Adicionar</button>
      </form>
      <ul className="list-disc pl-6">
        {colors.map(c => (
          <li key={c.id}>{c.value}</li>
        ))}
      </ul>
    </div>
  )
}
