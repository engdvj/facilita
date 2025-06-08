import { ChangeEvent, useEffect, useMemo, useState } from "react";
import api from "../api";
import LinkCard, { LinkData } from "../components/LinkCard";
import Header from "../components/Header";
import Hero from "../components/Hero";

import Carousel from "../components/Carousel";

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

  useEffect(() => {
    api.get("/links").then((res: any) => {
      const data = (res.data as LinkData[]).map((l) => {
        if (l.imageUrl && l.imageUrl.startsWith("/uploads/")) {
          return { ...l, imageUrl: `/api${l.imageUrl}` };
        }
        return l;
      });
      setLinks(data);
    });
    api.get("/categories").then((res: any) => setCategories(res.data));
  }, []);


  const filtered = links.filter((l: LinkData) => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryId === "all" || l.categoryId === categoryId;
    return matchSearch && matchCat;
  });

  const paginated = filtered;


  const categoryMap = useMemo(() => {
    const map: Record<number, Category> = {};
    for (const c of categories) map[c.id] = c;
    return map;
  }, [categories]);
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
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
              className="w-full pl-8 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 p-2 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6">
          <button
            onClick={() => {
              setCategoryId('all');
            }}
            className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors whitespace-nowrap ${
              categoryId === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 dark:bg-slate-700 text-gray-900 dark:text-white'
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
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'text-white'
                    : 'bg-indigo-50 dark:bg-slate-700 text-gray-900 dark:text-white'
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
        {paginated.length ? (

          <Carousel>
            {paginated.map((link: LinkData) => (
              <motion.div key={link.id} layout className="max-w-xs mx-auto">
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
