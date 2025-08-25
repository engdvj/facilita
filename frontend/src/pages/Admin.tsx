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
import DashboardLayout from "../components/layout/DashboardLayout";
import Sidebar, { SidebarSection } from "../components/layout/Sidebar";
import AppNavigation from "../components/layout/AppNavigation";

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

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
          if (!data.isAdmin) {
            navigate("/user/links");
          } else {
            setUser(data);
          }
        })
        .catch(() => navigate("/admin/login"));
    }
  }, [navigate]);

  const sidebarContent = (
    <Sidebar>
      <AppNavigation user={user} />
    </Sidebar>
  );

  return (
    <DashboardLayout
      title=""
      subtitle=""
      sidebar={sidebarContent}
      className="grid-cols-1"
    >
      <div className="col-span-full">
        <Outlet />
      </div>
    </DashboardLayout>
  );
}
