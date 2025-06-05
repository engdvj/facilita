import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import api from '../api'
import { LinkData } from '../components/LinkCard'

export default function AdminLinks() {
  const [links, setLinks] = useState<LinkData[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [colors, setColors] = useState<{ id: number; value: string }[]>([])
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    category_id: null as number | null,
    color: '',
    image_url: ''
  })

  useEffect(() => {
    refresh()
  }, [])

  const refresh = async () => {
    const [linkRes, catRes, colorRes] = await Promise.all([
      api.get('/links'),
      api.get('/categories'),
      api.get('/colors')
    ])
    setLinks(linkRes.data)
    setCategories(catRes.data)
    setColors(colorRes.data)
  }

  const handleCreate = async (e: any) => {
    e.preventDefault()
    try {
      const payload = { ...newLink }
      if (payload.category_id === null) delete (payload as any).category_id
      await api.post('/links', payload)
      await refresh()
      setNewLink({ title: '', url: '', category_id: null, color: '', image_url: '' })
      toast.success('Link criado')
    } catch {
      toast.error('Erro ao criar link')
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-xl font-heading">Links</h2>
      <form onSubmit={handleCreate} className="flex flex-col gap-2 max-w-sm bg-slate-800 p-4 rounded">
        <input
          className="p-2 rounded text-black"
          placeholder="Título"
          value={newLink.title}
          onChange={e => setNewLink({ ...newLink, title: e.target.value })}
        />
        <input
          className="p-2 rounded text-black"
          placeholder="URL"
          value={newLink.url}
          onChange={e => setNewLink({ ...newLink, url: e.target.value })}
        />
        <select
          className="p-2 rounded text-black"
          value={newLink.category_id ?? ''}
          onChange={e => {
            const val = e.target.value
            setNewLink({
              ...newLink,
              category_id: val === '' ? null : parseInt(val)
            })
          }}
        >
          <option value="">Categoria</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className="p-2 rounded text-black"
          value={newLink.color}
          onChange={e => setNewLink({ ...newLink, color: e.target.value })}
        >
          <option value="">Cor do card</option>
          {colors.map(c => (
            <option key={c.id} value={c.value}>{c.value}</option>
          ))}
        </select>
        <input
          className="p-2 rounded text-black"
          placeholder="URL da imagem"
          value={newLink.image_url}
          onChange={e => setNewLink({ ...newLink, image_url: e.target.value })}
        />
        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition-colors px-4 py-2 rounded text-white">Adicionar</button>
      </form>
      <motion.ul className="list-disc pl-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {links.map(l => (
          <motion.li key={l.id} layout>{l.title}</motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
