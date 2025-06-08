
import { ChangeEvent, useEffect, useState, useMemo } from "react";

import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Pencil, Trash2, Plus, Search, ChevronDown } from "lucide-react";
import api from "../api";
import { LinkData } from "../components/LinkCard";

export default function AdminDashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; color: string; icon: string }[]>([]);
  const [colors, setColors] = useState<{ id: number; value: string }[]>([]);
  const navigate = useNavigate();

  const [editColorId, setEditColorId] = useState<number | null>(null);
  const [editColor, setEditColor] = useState("#ffffff");

  const [linkQuery, setLinkQuery] = useState("");
  const [catQuery, setCatQuery] = useState("");
  const [colorQuery, setColorQuery] = useState("");

  const fieldClass =
    "p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-700";
  const colorInputClass =
    "p-0 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-slate-700";

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    const [linkRes, catRes, colorRes] = await Promise.all([
      api.get("/links"),
      api.get("/categories"),
      api.get("/colors"),
    ]);
    setLinks(linkRes.data);
    setCategories(catRes.data);
    setColors(colorRes.data);
  };


  const removeLink = async (id: number) => {
    if (!confirm("Excluir link?")) return;
    await api.delete(`/links/${id}`);
    await refresh();
  };

  const startEditCat = (c: { id: number }) => {
    navigate(`/admin/categories/${c.id}`);
  };

  const removeCat = async (id: number) => {
    if (!confirm("Excluir categoria?")) return;
    await api.delete(`/categories/${id}`);
    await refresh();
  };

  const startEditColor = (c: { id: number; value: string }) => {
    setEditColorId(c.id);
    setEditColor(c.value);
  };

  const saveColor = async () => {
    if (editColorId === null) return;
    await api.patch(`/colors/${editColorId}`, { value: editColor });
    setEditColorId(null);
    await refresh();
  };

  const removeColor = async (id: number) => {
    if (!confirm("Excluir cor?")) return;
    await api.delete(`/colors/${id}`);
    await refresh();
  };

  const filteredLinks = links.filter((l) =>
    l.title.toLowerCase().includes(linkQuery.toLowerCase())
  );
  const filteredCats = categories.filter((c) =>
    c.name.toLowerCase().includes(catQuery.toLowerCase())
  );
  const filteredColors = colors.filter((c) =>
    c.value.toLowerCase().includes(colorQuery.toLowerCase())
  );

  const categoryMap = useMemo(() => {
    const map: Record<number, { id: number; name: string; color: string; icon: string }> = {};
    for (const c of categories) map[c.id] = c;
    return map;
  }, [categories]);

  return (


    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-900 dark:text-white">
      <div className="grid gap-8 md:grid-cols-3">
        <section className="bg-[#1c2233] rounded-2xl shadow-md hover:shadow-xl flex flex-col p-6 overflow-hidden">

          <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Links
              <span className="bg-[#7c3aed] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {links.length}
              </span>
            </h2>
            <Link
              to="/admin/links"
              className="px-3 py-1.5 rounded-md bg-[#7c3aed] text-white text-sm hover:bg-purple-700 flex items-center gap-1"
            >
              <Plus size={16} /> Novo
            </Link>
          </div>

          <div className="flex items-center mb-2">
            <Search size={16} className="mr-2 opacity-70" />
            <input
              className="flex-1 bg-transparent border-b border-gray-600 focus:outline-none text-sm"
              placeholder="Buscar"
              value={linkQuery}
              onChange={(e) => setLinkQuery(e.target.value)}
            />
          </div>

          <motion.ul
            className="flex gap-4 pb-2 overflow-x-auto snap-x"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            {filteredLinks.map((l) => (
              <motion.li
                key={l.id}
                layout
                className="min-w-[14rem] flex items-center gap-2 bg-[#1c2233] text-white p-3 rounded-2xl shadow-md hover:shadow-xl snap-start"
              >
                <span
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: categoryMap[l.categoryId || 0]?.color }}
                />
                <span className="flex-1">{l.title}</span>
                <Link
                  to={`/admin/links/${l.id}`}
                  className="p-1 hover:text-[#7c3aed]"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => removeLink(l.id)}
                  className="p-1 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </motion.li>
            ))}
          </motion.ul>
        </section>

        <section className="bg-[#1c2233] rounded-2xl shadow-md hover:shadow-xl flex flex-col p-6 overflow-hidden">
          <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Categorias
              <span className="bg-[#7c3aed] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {categories.length}
              </span>
            </h2>
            <Link
              to="/admin/categories"
              className="px-3 py-1.5 rounded-md bg-[#7c3aed] text-white text-sm hover:bg-purple-700 flex items-center gap-1"
            >
              <Plus size={16} /> Novo
            </Link>
          </div>
          <div className="flex items-center mb-2">
            <Search size={16} className="mr-2 opacity-70" />
            <input
              className="flex-1 bg-transparent border-b border-gray-600 focus:outline-none text-sm"
              placeholder="Buscar"
              value={catQuery}
              onChange={(e) => setCatQuery(e.target.value)}
            />
          </div>

          <motion.ul
            className="flex gap-4 pb-2 overflow-x-auto snap-x"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            {filteredCats.map((c) => (
              <motion.li
                key={c.id}
                layout
                className="min-w-[14rem] flex items-center gap-2 bg-[#1c2233] p-3 rounded-2xl shadow-md hover:shadow-xl snap-start"
              >
                <span className="w-4 h-4 rounded" style={{ backgroundColor: c.color }} />
                <span className="flex-1">{c.name}</span>
                <button onClick={() => startEditCat(c)} className="p-1 hover:text-[#7c3aed]">
                  <Pencil size={16} />
                </button>
                <button onClick={() => removeCat(c.id)} className="p-1 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </motion.li>
            ))}
          </motion.ul>
        </section>


        <section className="bg-[#1c2233] rounded-2xl shadow-md hover:shadow-xl flex flex-col p-6 overflow-hidden">

          <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Cores
              <span className="bg-[#7c3aed] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {colors.length}
              </span>
            </h2>
            <Link
              to="/admin/colors"
              className="px-3 py-1.5 rounded-md bg-[#7c3aed] text-white text-sm hover:bg-purple-700 flex items-center gap-1"
            >
              <Plus size={16} /> Novo
            </Link>
          </div>

          <div className="flex items-center mb-2">
            <Search size={16} className="mr-2 opacity-70" />
            <input
              className="flex-1 bg-transparent border-b border-gray-600 focus:outline-none text-sm"
              placeholder="Buscar"
              value={colorQuery}
              onChange={(e) => setColorQuery(e.target.value)}
            />
          </div>

          <motion.ul
            className="flex gap-4 pb-2 overflow-x-auto snap-x"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredColors.map((c) => (
              <motion.li
                key={c.id}
                layout
                className="min-w-[14rem] flex items-center gap-2 bg-[#1c2233] p-3 rounded-2xl shadow-md hover:shadow-xl snap-start"
              >
                <span className="w-4 h-4 rounded" style={{ backgroundColor: c.value }} />
                {editColorId === c.id ? (
                  <>
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setEditColor(e.target.value)}
                      className={`${colorInputClass} w-20 h-8`}
                    />
                    <button onClick={saveColor} className="p-1 text-green-400">
                      <ChevronDown size={16} />
                    </button>
                    <button onClick={() => setEditColorId(null)} className="p-1 text-yellow-400">
                      <ChevronDown size={16} className="rotate-180" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-mono">{c.value}</span>
                    <button onClick={() => startEditColor(c)} className="p-1 hover:text-[#7c3aed]">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => removeColor(c.id)} className="p-1 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </motion.li>
            ))}
          </motion.ul>
        </section>
      </div>
    </div>
  );
}
