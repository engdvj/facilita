import { useEffect, useState } from "react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Link2,
  Folder,
  Palette,
  Home as HomeIcon,
  File as FileIcon,
  Users,
} from "lucide-react";

import { motion } from "framer-motion";
import Header from "../components/Header";
import api from "../api";

export default function Admin() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loggedIn =
      sessionStorage.getItem("loggedIn") === "true" ||
      localStorage.getItem("loggedIn") === "true";
    if (!loggedIn) {
      navigate("/admin/login");
    } else {
      api
        .get("/auth/me")
        .then(({ data }) => {
          if (!data.isAdmin) navigate("/user/links");
        })
        .catch(() => navigate("/admin/login"));
    }
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ color: 'var(--text-color)' }}
    >

      <Header onMenuClick={() => setOpen((o) => !o)} sidebarOpen={open} />
      <div className="flex flex-1 overflow-hidden relative">
        <motion.aside
          className="nav-rail admin-nav w-64 p-5 space-y-4 transform transition-transform fixed top-16 bottom-0 left-0 z-20 rounded-r-3xl"
          style={{ color: 'var(--link-bar-text)' }}
          initial={false}
          animate={{ x: open ? 0 : -256 }}
        >
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
            <p className="nav-label">Painel</p>
            <p className="font-heading text-lg text-white">Admin</p>
          </div>
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className="nav-pill w-full justify-start text-sm font-medium mb-4"
          >
            <HomeIcon size={18} /> Início
          </NavLink>
          <nav className="flex flex-col gap-2">
            <NavLink
              end
              to="/admin"
              className="nav-pill w-full justify-start text-sm font-medium"
            >
              <HomeIcon size={18} /> Dashboard
            </NavLink>
            <NavLink
              to="/admin/links"
              className="nav-pill w-full justify-start text-sm font-medium"
            >
              <Link2 size={18} /> Links
            </NavLink>
            <NavLink
              to="/admin/files"
              className="nav-pill w-full justify-start text-sm font-medium"
            >
              <FileIcon size={18} /> Arquivos
            </NavLink>
            <NavLink
              to="/admin/categories"
              className="nav-pill w-full justify-start text-sm font-medium"
            >
              <Folder size={18} /> Categorias
            </NavLink>
            <NavLink
              to="/admin/colors"
              className="nav-pill w-full justify-start text-sm font-medium"
            >
              <Palette size={18} /> Cores
            </NavLink>
            <NavLink
              to="/admin/users"
              className="nav-pill w-full justify-start text-sm font-medium"
            >
              <Users size={18} /> Usuários
            </NavLink>
          </nav>
        </motion.aside>
        <main

          className={`flex-1 p-4 md:p-8 transition-all ${
            open ? "translate-x-64 md:translate-x-0 md:ml-64" : "md:ml-0"
          }`}
          style={{ color: 'var(--text-color)' }}

        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
