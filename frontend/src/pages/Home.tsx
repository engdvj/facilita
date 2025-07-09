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
        backgroundColor: 'var(--background-main)',
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
            className="w-64 p-6 space-y-4 transform transition-transform fixed top-16 bottom-0 left-0 z-20"
            style={{ backgroundColor: 'var(--card-background)', color: 'var(--link-bar-text)' }}
            initial={false}
            animate={{ x: open ? 0 : -256 }}
          >
            <NavLink
              to="/"
              onClick={() => setOpen(false)}
              className="mb-4 hover:underline flex items-center gap-1 px-2 py-1 rounded"
            >
              <HomeIcon size={18} /> Início
            </NavLink>

            <nav className="flex flex-col gap-2">
              {user?.isAdmin ? (
                <>
                  <NavLink
                    end
                    to="/admin"
                    className={({ isActive }) =>
                      `hover:underline flex items-center gap-1 px-2 py-1 rounded`
                    }
                    style={({ isActive }) =>
                      isActive ? { backgroundColor: 'var(--hover-effect)' } : undefined
                    }
                  >
                    <HomeIcon size={18} /> Dashboard
                  </NavLink>
                  <NavLink
                    to="/admin/links"
                    className={({ isActive }) =>
                      `hover:underline flex items-center gap-1 px-2 py-1 rounded`
                    }
                    style={({ isActive }) =>
                      isActive ? { backgroundColor: 'var(--hover-effect)' } : undefined
                    }
                  >
                    <Link2 size={18} /> Links
                  </NavLink>
                  <NavLink
                    to="/admin/files"
                    className={({ isActive }) =>
                      `hover:underline flex items-center gap-1 px-2 py-1 rounded`
                    }
                    style={({ isActive }) =>
                      isActive ? { backgroundColor: 'var(--hover-effect)' } : undefined
                    }
                  >
                    <FileIcon size={18} /> Arquivos
                  </NavLink>
                  <NavLink
                    to="/admin/categories"
                    className={({ isActive }) =>
                      `hover:underline flex items-center gap-1 px-2 py-1 rounded`
                    }
                    style={({ isActive }) =>
                      isActive ? { backgroundColor: 'var(--hover-effect)' } : undefined
                    }
                  >
                    <Folder size={18} /> Categorias
                  </NavLink>
                  <NavLink
                    to="/admin/colors"
                    className={({ isActive }) =>
                      `hover:underline flex items-center gap-1 px-2 py-1 rounded`
                    }
                    style={({ isActive }) =>
                      isActive ? { backgroundColor: 'var(--hover-effect)' } : undefined
                    }
                  >
                    <Palette size={18} /> Cores
                  </NavLink>
                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                      `hover:underline flex items-center gap-1 px-2 py-1 rounded`
                    }
                    style={({ isActive }) =>
                      isActive ? { backgroundColor: 'var(--hover-effect)' } : undefined
                    }
                  >
                    <Users size={18} /> Usuários
                  </NavLink>
                </>
              ) : (
                <NavLink
                  to="/user/links"
                  className={({ isActive }) =>
                    `hover:underline flex items-center gap-1 px-2 py-1 rounded`
                  }
                  style={({ isActive }) =>
                    isActive ? { backgroundColor: 'var(--hover-effect)' } : undefined
                  }
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
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1 max-w-xs mx-auto sm:max-w-none">
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
                    className="w-full pl-8 rounded-full border border-gray-300 bg-white text-black py-1 px-2 text-sm sm:text-base shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* ---------- CATEGORIAS ---------- */}
              <div className="flex flex-wrap justify-center gap-2 pb-4 mb-4">
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
