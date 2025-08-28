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
import { useAuth } from "../contexts/AuthContext";

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  // Debug temporário
  console.log('Admin.tsx - user from useAuth:', user);
  console.log('Admin.tsx - user?.is_admin:', user?.is_admin);
  console.log('Admin.tsx - isAuthenticated:', isAuthenticated);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate("/admin/login");
      } else if (!user?.is_admin) {
        navigate("/unauthorized");
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user || !user.is_admin) {
    return null;
  }

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
