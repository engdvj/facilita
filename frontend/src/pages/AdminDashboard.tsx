// src/pages/AdminDashboard.tsx
import { ChangeEvent, useEffect, useMemo, useState } from "react";
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

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */
export default function AdminDashboard() {
  /* ---------- estado geral ----------------------------------------- */
  const [links, setLinks] = useState<LinkData[]>([]);
  const [categories, setCategories] = useState<
    { id: number; name: string; color: string; icon: string }[]
  >([]);
  const [colors, setColors] = useState<
    { id: number; value: string; name?: string }[]
  >([]);

  const navigate = useNavigate();

  /* ---------- edição de cor --------------------------------------- */
  const [editColorId, setEditColorId] = useState<number | null>(null);
  const [editColor, setEditColor] = useState("#000000");
  const [editColorName, setEditColorName] = useState("");

  /* ---------- busca + paginação ----------------------------------- */
  const [linkQuery, setLinkQuery] = useState("");
  const [catQuery, setCatQuery] = useState("");
  const [colorQuery, setColorQuery] = useState("");

  const perPage = 5;
  const [linkPage, setLinkPage] = useState(1);
  const [catPage, setCatPage] = useState(1);
  const [colorPage, setColorPage] = useState(1);

  /* ---------- classes utilitárias --------------------------------- */
  const fieldClass =
    "p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-[var(--input-background)] text-white";
  const colorInputClass =
    "p-0 border border-gray-300 dark:border-gray-700 rounded bg-[var(--input-background)] text-white";

  /* ---------------------------------------------------------------- */
  /* Carregamento inicial                                              */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    const [linkRes, catRes, colorRes] = await Promise.all([
      api.get("/links"),
      api.get("/categories"),
      api.get("/colors"),
    ]);
    setLinks(
      [...linkRes.data].sort((a, b) => a.title.localeCompare(b.title))
    );
    setCategories(
      [...catRes.data].sort((a, b) => a.name.localeCompare(b.name))
    );
    setColors(
      [...colorRes.data].sort((a, b) =>
        (a.name || a.value).localeCompare(b.name || b.value)
      )
    );
  };

  /* ---------------------------------------------------------------- */
  /* Ações CRUD                                                        */
  /* ---------------------------------------------------------------- */
  const removeLink = async (id: number) => {
    if (!confirm("Excluir link?")) return;
    await api.delete(`/links/${id}`);
    await refresh();
  };

  const startEditCat = (cat: { id: number }) => {
    navigate(`/admin/categories/${cat.id}`);
  };

  const removeCat = async (id: number) => {
    if (!confirm("Excluir categoria?")) return;
    await api.delete(`/categories/${id}`);
    await refresh();
  };

  const startEditColor = (c: { id: number; value: string; name?: string }) => {
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
    setEditColor("#000000");
    setEditColorName("");
    await refresh();
  };

  const removeColor = async (id: number) => {
    if (!confirm("Excluir cor?")) return;
    await api.delete(`/colors/${id}`);
    await refresh();
  };

  /* ---------------------------------------------------------------- */
  /* Filtros e paginação                                               */
  /* ---------------------------------------------------------------- */
  const filteredLinks = links
    .filter((l) => l.title.toLowerCase().includes(linkQuery.toLowerCase()))
    .sort((a, b) => a.title.localeCompare(b.title));
  const filteredCats = categories
    .filter((c) => c.name.toLowerCase().includes(catQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
  const filteredColors = colors
    .filter(
      (c) =>
        c.value.toLowerCase().includes(colorQuery.toLowerCase()) ||
        (c.name || "").toLowerCase().includes(colorQuery.toLowerCase())
    )
    .sort((a, b) => (a.name || a.value).localeCompare(b.name || b.value));

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

  /* ---------- lookup rápido de categoria -------------------------- */
  const categoryMap = useMemo(() => {
    const map: Record<
      number,
      { id: number; name: string; color: string; icon: string }
    > = {};
    for (const c of categories) map[c.id] = c;
    return map;
  }, [categories]);

  /* ---------------------------------------------------------------- */
  /* JSX                                                               */
  /* ---------------------------------------------------------------- */
  return (
    <div
      className="max-w-7xl mx-auto px-4 py-8 overflow-x-hidden"
      style={{ color: "var(--text-color)" }}
    >
      <div className="grid gap-8 md:grid-cols-3">
        {/* --------------------- COLUNA LINKS ------------------------ */}
        <LinksColumn
          links={paginatedLinks}
          total={links.length}
          page={linkPage}
          pageCount={linkPageCount}
          setPage={setLinkPage}
          query={linkQuery}
          setQuery={setLinkQuery}
          removeLink={removeLink}
          categoryMap={categoryMap}
        />

        {/* ------------------- COLUNA CATEGORIAS --------------------- */}
        <CategoriesColumn
          cats={paginatedCats}
          total={categories.length}
          page={catPage}
          pageCount={catPageCount}
          setPage={setCatPage}
          query={catQuery}
          setQuery={setCatQuery}
          startEditCat={startEditCat}
          removeCat={removeCat}
        />

        {/* ---------------------- COLUNA CORES ----------------------- */}
        <ColorsColumn
          items={paginatedColors}
          total={colors.length}
          page={colorPage}
          pageCount={colorPageCount}
          setPage={setColorPage}
          query={colorQuery}
          setQuery={setColorQuery}
          editColorId={editColorId}
          editColor={editColor}
          editColorName={editColorName}
          setEditColor={setEditColor}
          setEditColorName={setEditColorName}
          startEditColor={startEditColor}
          saveColor={saveColor}
          removeColor={removeColor}
          colorInputClass={colorInputClass}
        />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  COMPONENTES AUXILIARES (colunas)                                  */
/* ================================================================== */

interface LinksColumnProps {
  links: LinkData[];
  total: number;
  page: number;
  pageCount: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  removeLink: (id: number) => Promise<void>;
  categoryMap: Record<number, { color: string; icon: string }>;
}

function LinksColumn({
  links,
  total,
  page,
  pageCount,
  setPage,
  query,
  setQuery,
  removeLink,
  categoryMap,
}: LinksColumnProps) {
  return (
    <section className="bg-[var(--card-background)] rounded-2xl shadow-md hover:shadow-xl flex flex-col p-6 overflow-hidden">
      <Header title="Links" total={total} />
      <SearchBar value={query} onChange={setQuery} />

      <motion.ul
        className="space-y-2 flex-1 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {links.map((l) => {
          const CatIcon =
            (Icons as any)[categoryMap[l.categoryId || 0]?.icon || "Link2"];
          return (
            <motion.li
              key={l.id}
              layout
              className="flex items-center gap-2 bg-[var(--card-background)] text-white p-3 rounded-2xl shadow-md hover:shadow-xl w-full"
            >
              <span
                className="w-4 h-4 rounded"
                style={{
                  backgroundColor: categoryMap[l.categoryId || 0]?.color,
                }}
              />
              {CatIcon && <CatIcon size={16} className="opacity-70" />}
              <span className="flex-1">{l.title}</span>
              <Link
                to={`/admin/links/${l.id}`}
                className="p-1 hover:text-[var(--accent-color)]"
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

      <Paginator {...{ page, pageCount, setPage }} />
    </section>
  );
}

interface CategoriesColumnProps {
  cats: { id: number; name: string; color: string; icon: string }[];
  total: number;
  page: number;
  pageCount: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  startEditCat: (cat: { id: number }) => void;
  removeCat: (id: number) => Promise<void>;
}

function CategoriesColumn({
  cats,
  total,
  page,
  pageCount,
  setPage,
  query,
  setQuery,
  startEditCat,
  removeCat,
}: CategoriesColumnProps) {
  return (
    <section className="bg-[var(--card-background)] rounded-2xl shadow-md hover:shadow-xl flex flex-col p-6 overflow-hidden">
      <Header title="Categorias" total={total} />
      <SearchBar value={query} onChange={setQuery} />

      <motion.ul
        className="space-y-2 flex-1 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {cats.map((c) => {
          const Icon = (Icons as any)[c.icon || "Folder"];
          return (
            <motion.li
              key={c.id}
              layout
              className="flex items-center gap-2 bg-[var(--card-background)] p-3 rounded-2xl text-white shadow-md hover:shadow-xl w-full"
            >
              <span
                className="w-4 h-4 rounded"
                style={{ backgroundColor: c.color }}
              />
              {Icon && <Icon size={16} className="opacity-70" />}
              <span className="flex-1">{c.name}</span>
              <button
                onClick={() => startEditCat(c)}
                className="p-1 hover:text-[var(--accent-color)]"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => removeCat(c.id)}
                className="p-1 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </motion.li>
          );
        })}
      </motion.ul>

      <Paginator {...{ page, pageCount, setPage }} />
    </section>
  );
}

interface ColorsColumnProps {
  items: { id: number; value: string; name?: string }[];
  total: number;
  page: number;
  pageCount: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  editColorId: number | null;
  editColor: string;
  editColorName: string;
  setEditColor: React.Dispatch<React.SetStateAction<string>>;
  setEditColorName: React.Dispatch<React.SetStateAction<string>>;
  startEditColor: (c: { id: number; value: string; name?: string }) => void;
  saveColor: () => Promise<void>;
  removeColor: (id: number) => Promise<void>;
  colorInputClass: string;
}

function ColorsColumn({
  items,
  total,
  page,
  pageCount,
  setPage,
  query,
  setQuery,
  editColorId,
  editColor,
  editColorName,
  setEditColor,
  setEditColorName,
  startEditColor,
  saveColor,
  removeColor,
  colorInputClass,
}: ColorsColumnProps) {
  return (
    <section className="bg-[var(--card-background)] rounded-2xl shadow-md hover:shadow-xl flex flex-col p-6 overflow-hidden">
      <Header title="Cores" total={total} />
      <SearchBar value={query} onChange={setQuery} />

      <motion.ul
        className="space-y-2 flex-1 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {items.map((c) => (
          <motion.li
            key={c.id}
            layout
            className="flex items-center gap-2 bg-[var(--card-background)] p-3 rounded-2xl shadow-md hover:shadow-xl text-white w-full"
          >
            <span className="w-4 h-4 rounded" style={{ backgroundColor: c.value }} />
            {editColorId === c.id ? (
              <>
                {/* valor hex */}
                <input
                  type="text"
                  value={editColor}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEditColor(e.target.value)
                  }
                  className={`${colorInputClass} w-24 h-8 px-2 font-mono`}
                />
                {/* nome opcional */}
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
                  style={{ backgroundColor: editColor }}
                />
                <button onClick={saveColor} className="p-1 text-green-400">
                  <ChevronDown size={16} />
                </button>
                <button
                  onClick={() => setEditColorId(null)}
                  className="p-1 text-yellow-400"
                >
                  <ChevronDown size={16} className="rotate-180" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 font-mono">
                  {c.value}
                  {c.name ? ` - ${c.name}` : ""}
                </span>
                <button
                  onClick={() => startEditColor(c)}
                  className="p-1 hover:text-[var(--accent-color)]"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => removeColor(c.id)}
                  className="p-1 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </motion.li>
        ))}
      </motion.ul>

      <Paginator {...{ page, pageCount, setPage }} />
    </section>
  );
}

/* ================================================================== */
/*  COMPONENTES PEQUENOS                                               */
/* ================================================================== */

function Header({ title, total }: { title: string; total: number }) {
  const pathMap: Record<string, string> = {
    Links: "links",
    Categorias: "categories",
    Cores: "colors",
  };
  const path = pathMap[title] || title.toLowerCase();

  return (
    <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        {title}
        <span className="bg-[var(--accent-color)] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          {total}
        </span>
      </h2>
      <Link
        to={`/admin/${path}`}
        className="px-3 py-1.5 rounded-md bg-[var(--accent-color)] text-white text-sm hover:bg-[var(--hover-effect)] flex items-center gap-1"
      >
        <Plus size={16} /> Novo
      </Link>
    </div>
  );
}

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center mb-2">
      <Search size={16} className="mr-2 opacity-70" />
      <input
        className="flex-1 bg-transparent border-b border-gray-600 focus:outline-none text-sm"
        placeholder="Buscar"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Paginator({
  page,
  pageCount,
  setPage,
}: {
  page: number;
  pageCount: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex justify-center gap-2 mt-2">
      <button
        disabled={page === 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="self-center">
        {page} / {pageCount}
      </span>
      <button
        disabled={page === pageCount}
        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
