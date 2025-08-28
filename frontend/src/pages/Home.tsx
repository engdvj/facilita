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
import { useNavigate, useLocation } from 'react-router-dom'

import api from '../api'
import Header from '../components/Header'
import AppNavigation from '../components/layout/AppNavigation'
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

  const [open, setOpen] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirecionar admin para dashboard apenas se ele acessar pela primeira vez
  // Mas permitir que ele volte à página pública se navegar explicitamente
  useEffect(() => {
    if (isAuthenticated && user?.is_admin && location.pathname === '/' && !sessionStorage.getItem('allowPublicView')) {
      navigate('/admin')
    }
  }, [location.pathname, isAuthenticated, user?.is_admin])

  // Limpar flag quando mudar de usuário
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('allowPublicView')
    }
  }, [user?.id])

  /* ---------- carregar dados ---------- */
  useEffect(() => {
    // Se for admin, já foi redirecionado. Para usuários, carregar apenas links públicos e próprios
    let endpoint = '/links'
    if (isAuthenticated && !user?.is_admin && user?.id) {
      endpoint = `/links?userId=${user.id}&includePublic=true`
    } else if (!isAuthenticated) {
      endpoint = '/links?publicOnly=true'
    }

    api.get(endpoint).then(({ data }) => {
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
  }, [isAuthenticated, user])

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
            className="w-60 transform transition-all fixed z-20 hover:shadow-lg"
            style={{
              top: '76px',
              height: 'calc(100vh - 76px)',
              background: 'var(--sidebar-background)',
              borderRight: `1px solid var(--sidebar-border)`,
              boxShadow: `0 4px 12px var(--card-shadow)`,
              transition: 'all 0.2s ease'
            }}
            initial={false}
            animate={{ 
              x: open ? 0 : -240
            }}
            transition={{ 
              type: "tween",
              duration: 0.2,
              ease: "easeOut"
            }}
          >
            <div className="h-full overflow-y-auto custom-scrollbar p-4 space-y-0">
              <AppNavigation user={user} onLinkClick={() => setOpen(false)} />
            </div>
          </motion.aside>
        )}

        <main
          className={`flex-1 transition-all duration-500 overflow-y-auto custom-scrollbar ${
            isAuthenticated && open ? 'lg:ml-60' : ''
          }`}
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
