
import { useEffect, useState } from "react";
import api from "../api";
import LinkCard, { LinkData } from "../components/LinkCard";
import Header from "../components/Header";
import { motion } from "framer-motion";


interface Category {
  id: number;
  name: string;
}

export default function Home() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "all">("all");

  useEffect(() => {
    api.get("/links").then((res: any) => setLinks(res.data));
    api.get("/categories").then((res: any) => setCategories(res.data));
  }, []);

  const filtered = links.filter((l: LinkData) => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryId === "all" || l.categoryId === categoryId;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

        <motion.div
        className="max-w-5xl mx-auto p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            type="text"
            placeholder="Buscar..."

            className="flex-1 rounded-md p-2 bg-slate-800 focus:bg-slate-700 transition-colors"
          />

          <select
            className="rounded-md p-2 bg-slate-800 text-white"
            value={categoryId}
            onChange={(e: any) => {
              const val = e.target.value;
              setCategoryId(val === "all" ? "all" : parseInt(val));
            }}
          >
            <option value="all">Todas categorias</option>
            {categories.map((c: Category) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((link: LinkData) => (
            <div key={link.id}>
              <LinkCard link={link} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
