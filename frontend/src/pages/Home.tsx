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
import { useAuth } from '../contexts/AuthContext'

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

  const [open, setOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()

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
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Header
        onMenuClick={isAuthenticated ? () => setOpen((o) => !o) : undefined}
        sidebarOpen={open}
        sticky
      />
      <div className="flex flex-1 overflow-hidden">
        {isAuthenticated && (
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
              {user?.is_admin ? (
                <>
                  <NavLink
                    end
                    to="/admin"
                    className={({ isActive }) =>
                      `hover:underline flex items-center gap-1 px-2 py-1 rounded`
                    }
                    style={({ isActive }) =>
                      isActive ? { backgroundColor: 'var(--sidebar-active-background)' } : undefined
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
                      isActive ? { backgroundColor: 'var(--sidebar-active-background)' } : undefined
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
                      isActive ? { backgroundColor: 'var(--sidebar-active-background)' } : undefined
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
                      isActive ? { backgroundColor: 'var(--sidebar-active-background)' } : undefined
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
                      isActive ? { backgroundColor: 'var(--sidebar-active-background)' } : undefined
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
                      isActive ? { backgroundColor: 'var(--sidebar-active-background)' } : undefined
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
          className={`flex-1 p-2 sm:p-4 md:p-6 lg:p-8 transition-all ${open ? 'translate-x-64 md:translate-x-0 md:ml-64' : 'md:ml-0'}`}
        >
          <Hero />

          {/* ---------- WRAPPER CENTRAL ---------- */}
          <motion.div
            className="py-3 sm:py-4 lg:py-5 xl:py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-7xl">
              {/* ---------- BUSCA ---------- */}
              <div className="flex justify-center mb-3 sm:mb-4 lg:mb-5">
                <div className="relative w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={search}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Buscar..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 bg-white/90 backdrop-blur-sm text-black text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* ---------- CATEGORIAS ---------- */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 xl:gap-5 pb-3 mb-4 sm:mb-5 lg:mb-6 max-w-6xl mx-auto px-2 overflow-hidden">
                <button
                  onClick={() => setCategoryId('all')}
                  className={`px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-full text-xs sm:text-sm lg:text-base font-medium whitespace-nowrap transition-all duration-200 ${
                    categoryId === 'all'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-sm'
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
                      className={`flex items-center gap-1 sm:gap-1.5 lg:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-full text-xs sm:text-sm lg:text-base font-medium whitespace-nowrap transition-all duration-200 min-w-0 max-w-32 sm:max-w-none ${
                        active
                          ? `${textColor} shadow-md`
                          : 'bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-sm'
                      }`}
                      style={active ? { backgroundColor: c.color } : undefined}
                    >
                      {Icon && <Icon size={12} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />}
                      <span className="truncate">{c.name}</span>
                    </button>
                  )
                })}
              </div>

              {/* ---------- LISTA DE LINKS ---------- */}
              {filtered.length ? (
                <div
                  className="
                    grid gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 justify-items-center
                    grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7
                    max-w-[85rem] mx-auto px-4
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
