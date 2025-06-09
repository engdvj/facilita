import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { Search } from 'lucide-react'

import api from '../api'
import Header from '../components/Header'
import Hero from '../components/Hero'
import LinkCard, { LinkData } from '../components/LinkCard'

/* ---------- helpers ---------- */
function isLight(hex: string) {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
}

interface Category {
  id: number
  name: string
  color?: string
  icon?: string
}

export default function Home() {
  const [links,       setLinks]       = useState<LinkData[]>([])
  const [categories,  setCategories]  = useState<Category[]>([])
  const [search,      setSearch]      = useState('')
  const [categoryId,  setCategoryId]  = useState<number | 'all'>('all')

  /* ---------- carregar dados ---------- */
  useEffect(() => {
    api.get('/links').then(({ data }) => {
      const cleaned = (data as LinkData[])
        .map(l =>
          l.imageUrl?.startsWith('/uploads/')
            ? { ...l, imageUrl: `/api${l.imageUrl}` }
            : l,
        )
        .sort((a, b) => a.title.localeCompare(b.title))
      setLinks(cleaned)
    })

    api.get('/categories').then(({ data }) =>
      setCategories(
        [...data].sort((a, b) => a.name.localeCompare(b.name)),
      ),
    )
  }, [])

  /* ---------- filtros ---------- */
  const filtered = links
    .filter(l => {
      const matchSearch = l.title
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchCat = categoryId === 'all' || l.categoryId === categoryId
      return matchSearch && matchCat
    })
    .sort((a, b) => a.title.localeCompare(b.title))

  const categoryMap = useMemo(() => {
    const m: Record<number, Category> = {}
    categories.forEach(c => (m[c.id] = c))
    return m
  }, [categories])

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  )

  /* ---------- UI ---------- */
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--background-main)',
        color: 'var(--text-color)',
      }}
    >
      <Header />
      <Hero />

      <motion.div
        className="container pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* ---------- BUSCA ---------- */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              placeholder="Buscar..."
              className="w-full pl-8 rounded-full border border-gray-300 bg-white text-black p-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* ---------- CATEGORIAS ---------- */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-4">
          <button
            onClick={() => setCategoryId('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              categoryId === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 dark:bg-slate-700 text-gray-900 dark:text-white'
            }`}
          >
            Todos
          </button>

          {sortedCategories.map(c => {
            const Icon = (Icons as any)[c.icon || '']
            const active = categoryId === c.id
            const textColor =
              c.color && isLight(c.color) ? 'text-black' : 'text-white'
            return (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? textColor
                    : 'bg-indigo-50 dark:bg-slate-700 text-gray-900 dark:text-white'
                }`}
                style={active ? { backgroundColor: c.color } : undefined}
              >
                {Icon && <Icon size={16} />}
                {c.name}
              </button>
            )
          })}
        </div>

        {/* ---------- LISTA DE LINKS ---------- */}
        {filtered.length ? (
          <div className="my-6 flex flex-wrap justify-center gap-4">
            {filtered.map(link => (
              <LinkCard
                key={link.id}
                link={{
                  ...link,
                  categoryColor: categoryMap[link.categoryId || 0]?.color,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">
            Nenhum link encontrado.
          </p>
        )}
      </motion.div>
    </div>
  )
}
