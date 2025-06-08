
import { ChangeEvent, useEffect, useState, useMemo } from "react";

import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as Icons from "lucide-react";
import api from "../api";
import { LinkData } from "../components/LinkCard";

export default function AdminDashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; color: string; icon: string }[]>([]);
  const [colors, setColors] = useState<

    { id: number; value: string; name?: string }[]

  >([]);
  const navigate = useNavigate();

  const [editColorId, setEditColorId] = useState<number | null>(null);
  const [editColor, setEditColor] = useState("#000000");
  const [editColorName, setEditColorName] = useState("");


  const [linkQuery, setLinkQuery] = useState("");
  const [catQuery, setCatQuery] = useState("");
  const [colorQuery, setColorQuery] = useState("");

  const perPage = 5;
  const [linkPage, setLinkPage] = useState(1);
  const [catPage, setCatPage] = useState(1);
  const [colorPage, setColorPage] = useState(1);

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

  const startEditColor = (

    c: { id: number; value: string; name?: string }

  ) => {
    setEditColorId(c.id);
    setEditColor(c.value);
    setEditColorName(c.name || "");

  };

  const saveColor = async () => {
    if (editColorId === null) return;
    await api.patch(`/colors/${editColorId}`, {
      value: editColor,
      name: editColorName || undefined,

    });
    setEditColorId(null);
    setEditColorName("");
    setEditColor("#000000");

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
    c.value.toLowerCase().includes(colorQuery.toLowerCase()) ||
    (c.name || "").toLowerCase().includes(colorQuery.toLowerCase())

  );

  const linkPageCount = Math.ceil(filteredLinks.length / perPage) || 1;
  const catPageCount = Math.ceil(filteredCats.length / perPage) || 1;
  const colorPageCount = Math.ceil(filteredColors.length / perPage) || 1;

  const paginatedLinks = filteredLinks.slice(
    (linkPage - 1) * perPage,
    linkPage * perPage
  );
  const paginatedCats = filteredCats.slice(
    (catPage - 1) * perPage,
    catPage * perPage

  );
  const paginatedColors = filteredColors.slice(
    (colorPage - 1) * perPage,
    colorPage * perPage
  );


  const linkPageCount = Math.ceil(filteredLinks.length / perPage) || 1;
  const catPageCount = Math.ceil(filteredCats.length / perPage) || 1;
  const colorPageCount = Math.ceil(filteredColors.length / perPage) || 1;

  const paginatedLinks = filteredLinks.slice(
    (linkPage - 1) * perPage,
    linkPage * perPage
  );
  const paginatedCats = filteredCats.slice(
    (catPage - 1) * perPage,
    catPage * perPage
  );
  const paginatedColors = filteredColors.slice(
    (colorPage - 1) * perPage,
    colorPage * perPage
  );


  const categoryMap = useMemo(() => {
    const map: Record<number, { id: number; name: string; color: string; icon: string }> = {};
    for (const c of categories) map[c.id] = c;
    return map;
  }, [categories]);

  return (


    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-900 dark:text-white overflow-x-hidden">
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
            className="space-y-2 flex-1 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {paginatedLinks.map((l) => {
              const CatIcon = (Icons as any)[
                categoryMap[l.categoryId || 0]?.icon || "Link2"
              ];
              return (
              <motion.li
                key={l.id}
                layout
                className="flex items-center gap-2 bg-[#1c2233] text-white p-3 rounded-2xl shadow-md hover:shadow-xl w-full"
              >
                  <span
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: categoryMap[l.categoryId || 0]?.color }}
                  />
                  {CatIcon && <CatIcon size={16} className="opacity-70" />}
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
              );
            })}
          </motion.ul>
          {linkPageCount > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              <button
                disabled={linkPage === 1}
                onClick={() => setLinkPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="self-center">
                {linkPage} / {linkPageCount}
              </span>
              <button
                disabled={linkPage === linkPageCount}
                onClick={() => setLinkPage((p) => Math.min(linkPageCount, p + 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
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
            className="space-y-2 flex-1 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {paginatedCats.map((c) => {
              const Icon = (Icons as any)[c.icon || "Folder"];
              return (
                <motion.li
                  key={c.id}
                  layout
                  className="flex items-center gap-2 bg-[#1c2233] p-3 rounded-2xl text-white shadow-md hover:shadow-xl w-full"
                >
                  <span className="w-4 h-4 rounded" style={{ backgroundColor: c.color }} />
                  {Icon && <Icon size={16} className="opacity-70" />}
                  <span className="flex-1">{c.name}</span>
                  <button onClick={() => startEditCat(c)} className="p-1 hover:text-[#7c3aed]">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => removeCat(c.id)} className="p-1 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
          {catPageCount > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              <button
                disabled={catPage === 1}
                onClick={() => setCatPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="self-center">
                {catPage} / {catPageCount}
              </span>
              <button
                disabled={catPage === catPageCount}
                onClick={() => setCatPage((p) => Math.min(catPageCount, p + 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
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
            className="space-y-2 flex-1 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {paginatedColors.map((c) => (
              <motion.li
                key={c.id}
                layout
                className="flex items-center gap-2 bg-[#1c2233] p-3 rounded-2xl shadow-md hover:shadow-xl text-white w-full"
              >
                <span className="w-4 h-4 rounded" style={{ backgroundColor: c.value }} />
                {editColorId === c.id ? (
                  <>
                    <input
                      type="text"
                      value={editColor}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setEditColor(e.target.value)
                      }

                      className={`${colorInputClass} w-12 h-8`}
                    />
                    <input
                      type="text"
                      value={editColor}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setEditColor(e.target.value)
                      }
                      className={`${colorInputClass} w-24 h-8 px-2 font-mono`}

                    />
                    <input
                      type="text"
                      placeholder="Nome"
                      value={editColorName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setEditColorName(e.target.value)
                      }
                      className={`${colorInputClass} w-28 h-8 px-2`}
                    />
                    <span
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: editColor || "transparent" }}
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
                    <span className="flex-1 font-mono">
                      {c.value}
                      {c.name ? ` - ${c.name}` : ""}

                    </span>
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
          {colorPageCount > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              <button
                disabled={colorPage === 1}
                onClick={() => setColorPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="self-center">
                {colorPage} / {colorPageCount}
              </span>
              <button
                disabled={colorPage === colorPageCount}
                onClick={() => setColorPage((p) => Math.min(colorPageCount, p + 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
