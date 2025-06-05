import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import api from '../api'

export default function AdminCategories() {
  const [categories, setCategories] = useState<{ id: number; name: string; color: string }[]>([])
  const [colors, setColors] = useState<{ id: number; value: string }[]>([])
  const [newCategory, setNewCategory] = useState({ name: '', color: '', icon: '' })

  useEffect(() => {
    refresh()
  }, [])

  const refresh = async () => {
    const [catRes, colorRes] = await Promise.all([api.get('/categories'), api.get('/colors')])
    setCategories(catRes.data)
    setColors(colorRes.data)
  }

  const handleCreate = async (e: any) => {
    e.preventDefault()
    try {
      await api.post('/categories', newCategory)
      await refresh()
      setNewCategory({ name: '', color: '', icon: '' })
      toast.success('Categoria criada')
    } catch {
      toast.error('Erro ao criar categoria')
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-xl font-heading">Categorias</h2>
      <form onSubmit={handleCreate} className="flex flex-col gap-2 max-w-sm bg-slate-800 p-4 rounded">
        <input
          className="p-2 rounded text-black"
          placeholder="Nome"
          value={newCategory.name}
          onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
        />
        <select
          className="p-2 rounded text-black"
          value={newCategory.color}
          onChange={e => setNewCategory({ ...newCategory, color: e.target.value })}
        >
          <option value="">Selecione a cor</option>
          {colors.map(c => (
            <option key={c.id} value={c.value}>{c.value}</option>
          ))}
        </select>
        <input
          className="p-2 rounded text-black"
          placeholder="Ícone"
          value={newCategory.icon}
          onChange={e => setNewCategory({ ...newCategory, icon: e.target.value })}
        />
        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-colors px-4 py-2 rounded text-white">Adicionar</button>
      </form>
      <motion.ul className="list-disc pl-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {categories.map(c => (
          <motion.li key={c.id} layout>{c.name}</motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
