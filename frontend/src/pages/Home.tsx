import { useEffect, useState } from 'react'
import api from '../api'
import LinkCard, { LinkData } from '../components/LinkCard'
import Header from '../components/Header'

interface Category {
  id: number
  name: string
}

export default function Home() {
  const [links, setLinks] = useState<LinkData[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | 'all'>('all')

  useEffect(() => {
    api.get('/links').then((res) => setLinks(res.data))
    api.get('/categories').then((res) => setCategories(res.data))
  }, [])

  const filtered = links.filter((l) => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryId === 'all' || l.category === categories.find((c) => c.id === categoryId)?.name
    return matchSearch && matchCat
  })

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Buscar..."
            className="flex-1 rounded-md p-2"/>
          <select
            className="rounded-md p-2"
            value={categoryId}
            onChange={(e) => {
              const val = e.target.value
              setCategoryId(val === 'all' ? 'all' : parseInt(val))
            }}
          >
            <option value="all">Todas categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      </div>
    </div>
  )
}
