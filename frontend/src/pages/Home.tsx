import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import {
  Home as HomeIcon,
  Link2,
  File as FileIcon,
  Folder,
  Palette,
  Users,
  X,
  Search,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

import api from '../api'
import Header from '../components/Header'
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
        search={search}
        onSearchChange={setSearch}
        showSearch={true}
        categories={categories}
        selectedCategory={categoryId}
        onCategoryChange={setCategoryId}
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
          className={`flex-1 transition-all ${open ? 'translate-x-64 md:translate-x-0 md:ml-64' : 'md:ml-0'}`}
        >
          {/* ---------- LAYOUT PROFISSIONAL - ESTILO GOOGLE/MICROSOFT ---------- */}
          <motion.div
            className="min-h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Container principal com padding responsivo - Otimizado para widescreen */}
            <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8" style={{ 
              paddingLeft: 'clamp(1rem, 8vw, 8rem)', 
              paddingRight: 'clamp(1rem, 8vw, 8rem)' 
            }}>
              
              {/* Header de estatísticas (opcional) */}
              {filtered.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {filtered.length} {filtered.length === 1 ? 'link encontrado' : 'links encontrados'}
                      {categoryId !== 'all' && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {categories.find(c => c.id === categoryId)?.name}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Grid de Links - Cards Menores e Centralizados */}
              {filtered.length ? (
                <div className="widescreen-responsive-grid">
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
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum link encontrado
                    </h3>
                    <p className="text-gray-500">
                      {search ? 
                        `Não encontramos resultados para "${search}". Tente uma busca diferente.` :
                        'Não há links disponíveis nesta categoria.'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
