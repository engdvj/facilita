import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
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
    <div className="space-y-6">
      <h2 className="text-xl">Categorias</h2>
      <form onSubmit={handleCreate} className="flex flex-col gap-2 max-w-sm">
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
        <button className="bg-blue-600 px-4 py-2 rounded">Adicionar</button>
      </form>
      <ul className="list-disc pl-6">
        {categories.map(c => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
    </div>
  )
}
