import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Link2, Folder, Palette, Home } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../components/Header";

export default function Admin() {
  const navigate = useNavigate();

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
        className="bg-indigo-100 dark:bg-slate-800 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="container mx-auto flex justify-evenly text-gray-900 dark:text-white">
          <Link to="/admin" className="hover:underline flex items-center gap-1">
            <Home size={18} /> Dashboard
          </Link>
          <Link to="/admin/categories" className="hover:underline flex items-center gap-1">
            <Folder size={18} /> Categorias
          </Link>
          <Link to="/admin/links" className="hover:underline flex items-center gap-1">
            <Link2 size={18} /> Links
          </Link>
          <Link to="/admin/colors" className="hover:underline flex items-center gap-1">
            <Palette size={18} /> Cores
          </Link>
        </div>
      </motion.nav>
      <div className="py-8 px-4 container mx-auto flex-1 text-gray-900 dark:text-white">
        <Outlet />
      </div>
    </div>
  );
}
