import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Link2, Folder, Palette, Home, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api";
import Header from "../components/Header";

export default function Admin() {
  const navigate = useNavigate();

  const logout = async () => {
    await api.post("/auth/logout");
    localStorage.removeItem("loggedIn");
    navigate("/admin/login");
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    if (!loggedIn) {
      navigate("/admin/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex flex-col">
      <Header />
      <motion.nav
        className="bg-indigo-100 dark:bg-slate-800 py-6 flex justify-center gap-8 text-gray-900 dark:text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Link to="/admin" className="hover:underline flex items-center gap-1">
          <Home size={18} /> Dashboard
        </Link>
        <Link to="/admin/links" className="hover:underline flex items-center gap-1">
          <Link2 size={18} /> Links
        </Link>
        <Link to="/admin/categories" className="hover:underline flex items-center gap-1">
          <Folder size={18} /> Categorias
        </Link>
        <Link to="/admin/colors" className="hover:underline flex items-center gap-1">
          <Palette size={18} /> Cores
        </Link>
        <button onClick={logout} className="hover:underline flex items-center gap-1">
          <LogOut size={18} /> Sair
        </button>
      </motion.nav>
      <div className="py-8 px-4 container mx-auto flex-1 text-gray-900 dark:text-white">
        <Outlet />
      </div>
    </div>
  );
}
