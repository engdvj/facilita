import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import {
  Search,
  Home as HomeIcon,
  Link2,
  File as FileIcon,
  Folder,
  Palette,
  Users,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

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
  const [links, setLinks] = useState<LinkData[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | 'all'>('all')

  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState<{ username: string; isAdmin: boolean } | null>(null)
  const [open, setOpen] = useState(false)

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

  useEffect(() => {
    const li =
      sessionStorage.getItem('loggedIn') === 'true' ||
      localStorage.getItem('loggedIn') === 'true'
    setLoggedIn(li)
    if (li) {
      api
        .get('/auth/me')
        .then(({ data }) => setUser(data))
        .catch(() => setUser(null))
    }
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
      className="min-h-screen flex flex-col"
      style={{
        color: 'var(--text-color)',
      }}
    >
      <Header
        onMenuClick={loggedIn ? () => setOpen((o) => !o) : undefined}
        sidebarOpen={open}
        sticky
      />
      <div className="flex flex-1 overflow-hidden relative">
        {loggedIn && (
          <motion.aside
            className="nav-rail w-64 p-5 space-y-4 transform transition-transform fixed top-16 bottom-0 left-0 z-20 rounded-r-3xl"
            style={{ color: 'var(--link-bar-text)' }}
            initial={false}
            animate={{ x: open ? 0 : -256 }}
          >
            <NavLink
              to="/"
              onClick={() => setOpen(false)}
              className="nav-pill w-full justify-start text-sm font-medium mb-4"
            >
              <HomeIcon size={18} /> Início
            </NavLink>

            <nav className="flex flex-col gap-2">
              {user?.isAdmin ? (
                <>
                  <NavLink
                    end
                    to="/admin"
                    className="nav-pill w-full justify-start text-sm font-medium"
                  >
                    <HomeIcon size={18} /> Dashboard
                  </NavLink>
                  <NavLink
                    to="/admin/links"
                    className="nav-pill w-full justify-start text-sm font-medium"
                  >
                    <Link2 size={18} /> Links
                  </NavLink>
                  <NavLink
                    to="/admin/files"
                    className="nav-pill w-full justify-start text-sm font-medium"
                  >
                    <FileIcon size={18} /> Arquivos
                  </NavLink>
                  <NavLink
                    to="/admin/categories"
                    className="nav-pill w-full justify-start text-sm font-medium"
                  >
                    <Folder size={18} /> Categorias
                  </NavLink>
                  <NavLink
                    to="/admin/colors"
                    className="nav-pill w-full justify-start text-sm font-medium"
                  >
                    <Palette size={18} /> Cores
                  </NavLink>
                  <NavLink
                    to="/admin/users"
                    className="nav-pill w-full justify-start text-sm font-medium"
                  >
                    <Users size={18} /> Usuários
                  </NavLink>
                </>
              ) : (
                <NavLink
                  to="/user/links"
                  className="nav-pill w-full justify-start text-sm font-medium"
                >
                  <Link2 size={18} /> Links
                </NavLink>
              )}
            </nav>
          </motion.aside>
        )}

        <main
          className={`flex-1 ${loggedIn ? 'p-4 md:p-8 transition-all' : ''} ${
            loggedIn ? (open ? 'md:ml-64' : 'md:ml-0') : ''
          }`}
        >
          <Hero />

          {/* ---------- WRAPPER CENTRAL ---------- */}
          <motion.div
            className="pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mx-auto w-full max-w-7xl px-4">
              {/* ---------- BUSCA ---------- */}
              <div className="flex items-center gap-2 mb-6">
                <div className="relative flex-1 max-w-xs mx-auto sm:max-w-none">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    value={search}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Buscar..."
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-white/70 bg-white/80 text-slate-900 text-sm sm:text-base shadow-[0_14px_28px_rgba(15,23,42,0.12)] outline-none backdrop-blur focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent"
                  />
                </div>
              </div>

              {/* ---------- CATEGORIAS ---------- */}
              <div className="flex flex-wrap justify-center gap-3 pb-6 mb-6">
                <button
                  onClick={() => setCategoryId('all')}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border ${
                    categoryId === 'all'
                      ? 'text-white shadow-[0_12px_26px_rgba(249,115,22,0.35)] border-transparent'
                      : 'bg-white/70 border-white/60 text-slate-900 hover:bg-white'
                  }`}
                  style={
                    categoryId === 'all'
                      ? {
                          background:
                            'linear-gradient(120deg, var(--button-primary), var(--accent-color))',
                        }
                      : undefined
                  }
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
                      className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border ${
                        active
                          ? `${textColor} shadow-[0_12px_26px_rgba(15,23,42,0.25)] border-transparent`
                          : 'bg-white/70 border-white/60 text-slate-900 hover:bg-white'
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
                <div
                  className="
                    grid gap-4
                    grid-cols-[repeat(auto-fill,minmax(150px,1fr))]
                    sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]
                    justify-center
                    lg:justify-start
                  "
                >
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
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
