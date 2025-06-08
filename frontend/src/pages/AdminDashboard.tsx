
import { ChangeEvent, useEffect, useState, useMemo } from "react";

import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api";
import { LinkData } from "../components/LinkCard";

export default function AdminDashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; color: string; icon: string }[]>([]);
  const [colors, setColors] = useState<{ id: number; value: string }[]>([]);
  const navigate = useNavigate();

  const [editColorId, setEditColorId] = useState<number | null>(null);
  const [editColor, setEditColor] = useState("#ffffff");

  const [linkPage, setLinkPage] = useState(1);
  const [catPage, setCatPage] = useState(1);
  const [colorPage, setColorPage] = useState(1);

  // show a maximum of 4 items per page to avoid scrolling
  const perPage = 4;

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

  const linkPageCount = Math.ceil(links.length / perPage) || 1;
  const catPageCount = Math.ceil(categories.length / perPage) || 1;
  const colorPageCount = Math.ceil(colors.length / perPage) || 1;

  const paginatedLinks = links.slice((linkPage - 1) * perPage, linkPage * perPage);
  const paginatedCats = categories.slice((catPage - 1) * perPage, catPage * perPage);
  const paginatedColors = colors.slice((colorPage - 1) * perPage, colorPage * perPage);

  const categoryMap = useMemo(() => {
    const map: Record<number, { id: number; name: string; color: string; icon: string }> = {};
    for (const c of categories) map[c.id] = c;
    return map;
  }, [categories]);

  return (


    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-900 dark:text-white">
      <div className="grid gap-8 md:grid-cols-3">
        <section className="bg-white dark:bg-slate-800 rounded-lg shadow-lg flex flex-col p-6 overflow-hidden">

          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            <h2 className="text-lg font-semibold">Links ({links.length})</h2>
            <Link
              to="/admin/links"
              className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
            >
              Novo
            </Link>
          </div>

          <motion.ul className="space-y-2 flex-1 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {paginatedLinks.map((l) => (
              <motion.li
                key={l.id}
                layout
                className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg text-gray-900 dark:text-white"
              >
                <span
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: categoryMap[l.categoryId || 0]?.color }}
                />
                <span className="flex-1">{l.title}</span>
                <Link to={`/admin/links/${l.id}`} className="text-sm text-blue-400">
                  Editar
                </Link>
                <button onClick={() => removeLink(l.id)} className="text-sm text-red-400">
                  Excluir
                </button>
              </motion.li>
            ))}
          </motion.ul>
          {linkPageCount > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              <button
                disabled={linkPage === 1}
                onClick={() => setLinkPage((p: number) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="self-center">
                {linkPage} / {linkPageCount}
              </span>
              <button
                disabled={linkPage === linkPageCount}
                onClick={() => setLinkPage((p: number) => Math.min(linkPageCount, p + 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-lg shadow-lg flex flex-col p-6 overflow-hidden">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            <h2 className="text-lg font-semibold">Categorias ({categories.length})</h2>
            <Link
              to="/admin/categories"
              className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
            >
              Novo
            </Link>
          </div>

          <motion.ul className="space-y-2 flex-1 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {paginatedCats.map((c) => (
              <motion.li key={c.id} layout className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg text-gray-900 dark:text-white">
                <span className="w-4 h-4 rounded" style={{ backgroundColor: c.color }} />
                <span className="flex-1">{c.name}</span>
                <button onClick={() => startEditCat(c)} className="text-sm text-blue-400">Editar</button>
                <button onClick={() => removeCat(c.id)} className="text-sm text-red-400">Excluir</button>
              </motion.li>
            ))}
          </motion.ul>
          {catPageCount > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              <button
                disabled={catPage === 1}
                onClick={() => setCatPage((p: number) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="self-center">
                {catPage} / {catPageCount}
              </span>
              <button
                disabled={catPage === catPageCount}
                onClick={() => setCatPage((p: number) => Math.min(catPageCount, p + 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </section>


        <section className="bg-white dark:bg-slate-800 rounded-lg shadow-lg flex flex-col p-6 overflow-hidden">

          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            <h2 className="text-lg font-semibold">Cores ({colors.length})</h2>
            <Link
              to="/admin/colors"
              className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
            >
              Novo
            </Link>
          </div>
          <motion.ul className="space-y-2 flex-1 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {paginatedColors.map((c) => (
              <motion.li key={c.id} layout className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg text-gray-900 dark:text-white">
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
                    <button onClick={saveColor} className="text-sm text-green-400">Salvar</button>
                    <button onClick={() => setEditColorId(null)} className="text-sm text-yellow-400">Cancelar</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{c.value}</span>
                    <button onClick={() => startEditColor(c)} className="text-sm text-blue-400">Editar</button>
                    <button onClick={() => removeColor(c.id)} className="text-sm text-red-400">Excluir</button>
                  </>
                )}
              </motion.li>
            ))}
          </motion.ul>
          {colorPageCount > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              <button
                disabled={colorPage === 1}
                onClick={() => setColorPage((p: number) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="self-center">
                {colorPage} / {colorPageCount}
              </span>
              <button
                disabled={colorPage === colorPageCount}
                onClick={() => setColorPage((p: number) => Math.min(colorPageCount, p + 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
