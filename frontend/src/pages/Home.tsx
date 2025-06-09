import { ChangeEvent, useEffect, useMemo, useState } from "react";
import api from "../api";
import LinkCard, { LinkData } from "../components/LinkCard";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Carousel from "../components/Carousel";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Search } from "lucide-react";

function isLight(hex: string) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

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

  useEffect(() => {
    api.get("/links").then((res: any) => {
      const data = (res.data as LinkData[])
        .map((l) => {
          if (l.imageUrl && l.imageUrl.startsWith("/uploads/")) {
            return { ...l, imageUrl: `/api${l.imageUrl}` };
          }
          return l;
        })
        .sort((a, b) => a.title.localeCompare(b.title));
      setLinks(data);
    });
    api
      .get("/categories")
      .then((res: any) =>
        setCategories(
          [...res.data].sort((a, b) => a.name.localeCompare(b.name))
        )
      );
  }, []);


  const filtered = links
    .filter((l: LinkData) => {
      const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryId === "all" || l.categoryId === categoryId;
      return matchSearch && matchCat;
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const paginated = filtered;
  const categoryMap = useMemo(() => {
    const map: Record<number, Category> = {};
    for (const c of categories) map[c.id] = c;
    return map;
  }, [categories]);
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--background-main)', color: 'var(--text-color)' }}
    >
      <Header />
      <Hero />
      <motion.div
        className="container pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* intentionally left blank to remove the old heading */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              type="text"
              placeholder="Buscar..."
              className="w-full pl-8 rounded-full border border-gray-300 bg-white text-black p-2 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6">
          <button
            onClick={() => {
              setCategoryId('all');
            }}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              categoryId === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 dark:bg-slate-700 text-gray-900 dark:text-white'
            }`}
          >
            Todos
          </button>
          {sortedCategories.map((c: Category) => {
            const Icon = (Icons as any)[c.icon || ''];
            const active = categoryId === c.id;
            const activeText = c.color && isLight(c.color) ? 'text-black' : 'text-white';
            return (
              <button
                key={c.id}
                onClick={() => {
                  setCategoryId(c.id);
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? activeText
                    : 'bg-indigo-50 dark:bg-slate-700 text-gray-900 dark:text-white'
                }`}
                style={active ? { backgroundColor: c.color } : undefined}
              >
                {Icon && <Icon size={16} />}
                {c.name}
              </button>
            );
          })}
        </div>
        {paginated.length ? (
          <Carousel>
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
          </Carousel>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">Nenhum link encontrado.</p>
        )}
        
      </motion.div>
    </div>
  );
}
