import { useEffect, useState } from "react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Link2, Folder, Palette, Home, X } from "lucide-react";

import { motion } from "framer-motion";
import Header from "../components/Header";

export default function Admin() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    if (!loggedIn) {
      navigate("/admin/login");
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--background-main)', color: 'var(--text-color)' }}
    >

      <Header onMenuClick={() => setOpen((o) => !o)} sidebarOpen={open} />
      <div className="flex flex-1 overflow-hidden relative">
        <motion.aside

          className="bg-indigo-100 dark:bg-[#1c2233] text-gray-900 dark:text-white w-64 p-6 space-y-4 transform transition-transform fixed top-16 bottom-0 left-0 z-20"

          initial={false}
          animate={{ x: open ? 0 : -256 }}
        >
          <button className="mb-4" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
          <nav className="flex flex-col gap-2">
            <NavLink
              end
              to="/admin"
              className={({ isActive }) =>
                `hover:underline flex items-center gap-1 px-2 py-1 rounded ${
                  isActive ? "bg-indigo-200 dark:bg-slate-700" : ""}
                `
              }
            >
              <Home size={18} /> Dashboard
            </NavLink>
            <NavLink
              to="/admin/links"
              className={({ isActive }) =>
                `hover:underline flex items-center gap-1 px-2 py-1 rounded ${
                  isActive ? "bg-indigo-200 dark:bg-slate-700" : ""}
                `
              }
            >
              <Link2 size={18} /> Links
            </NavLink>
            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                `hover:underline flex items-center gap-1 px-2 py-1 rounded ${
                  isActive ? "bg-indigo-200 dark:bg-slate-700" : ""}
                `
              }
            >
              <Folder size={18} /> Categorias
            </NavLink>
            <NavLink
              to="/admin/colors"
              className={({ isActive }) =>
                `hover:underline flex items-center gap-1 px-2 py-1 rounded ${
                  isActive ? "bg-indigo-200 dark:bg-slate-700" : ""}
                `
              }
            >
              <Palette size={18} /> Cores
            </NavLink>
          </nav>
        </motion.aside>
        <main

          className={`flex-1 p-4 md:p-8 text-gray-900 dark:text-white transition-all ${
            open ? "translate-x-64 md:translate-x-0 md:ml-64" : "md:ml-0"
          }`}

        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
