import { useEffect, useMemo, useState } from "react";
import api from "../api";
import LinkCard, { LinkData } from "../components/LinkCard";
import Header from "../components/Header";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Search } from "lucide-react";

interface Category {
  id: number;
  name: string;
  color?: string;
  icon?: string;
}

export default function Home() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "all">("all");
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    api.get("/links").then((res: any) => setLinks(res.data));
    api.get("/categories").then((res: any) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, categoryId]);

  const filtered = links.filter((l: LinkData) => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryId === "all" || l.categoryId === categoryId;
    return matchSearch && matchCat;
  });

  const pageCount = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const categoryMap = useMemo(() => {
    const map: Record<number, Category> = {};
    for (const c of categories) map[c.id] = c;
    return map;
  }, [categories]);

  const categoryMap = useMemo(() => {
    const map: Record<number, Category> = {};
    for (const c of categories) map[c.id] = c;
    return map;
  }, [categories]);
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      <Header />
      <motion.div
        className="container py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="text-3xl text-center font-heading mb-6">Links em destaque</h1>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              type="text"
              placeholder="Buscar..."
              className="w-full pl-8 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 p-2"
            />
          </div>
        </div>
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6">
          <button
            onClick={() => {
              setCategoryId('all');
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full border transition-colors whitespace-nowrap ${
              categoryId === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white'
            }`}
          >
            Todos
          </button>
          {categories.map((c: Category) => {
            const Icon = (Icons as any)[c.icon || 'Circle'];
            const active = categoryId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setCategoryId(c.id);
                  setPage(1);
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-colors whitespace-nowrap ${
                  active
                    ? 'text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white'
                }`}
                style={
                  active
                    ? { backgroundColor: c.color }
                    : { borderColor: c.color || 'transparent' }
                }
              >
                {Icon && <Icon size={16} />}
                {c.name}
              </button>
            );
          })}
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {paginated.map((link: LinkData) => (
            <motion.div key={link.id} layout>
              <LinkCard
                link={{
                  ...link,
                  categoryColor: categoryMap[link.categoryId || 0]?.color,
                }}
              />
            </motion.div>
          ))}
        </div>
        {pageCount > 1 && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="self-center">
              {page} / {pageCount}
            </span>
            <button
              disabled={page === pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
