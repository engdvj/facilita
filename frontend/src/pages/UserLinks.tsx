import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Trash2, Link2, Plus, ExternalLink } from "lucide-react";
import * as Icons from "lucide-react";
import api from "../api";
import { LinkData } from "../components/LinkCard";
import DashboardLayout from "../components/layout/DashboardLayout";
import Sidebar, { SidebarSection } from "../components/layout/Sidebar";
import AppNavigation from "../components/layout/AppNavigation";
import DashboardColumn from "../components/common/DashboardColumn";
import ListItem from "../components/common/ListItem";
import DashboardCard from "../components/common/DashboardCard";
import ActionButton from "../components/common/ActionButton";

/* ------------------------------------------------------------------ */
/* Tipos auxiliares                                                    */
/* ------------------------------------------------------------------ */
interface Category {
  id: number;
  name: string;
  color: string;
}
interface Color {
  id: number;
  value: string;
  name?: string;

}
interface LinkFormData {
  title: string;
  url: string;
  file_url: string;
  category_id: number | null;
  color: string;
  image_url: string;
}

interface FileItem {
  id: number;
  title: string;
  fileUrl: string;
}

interface CurrentUser {
  id: number;
  username: string;
  isAdmin: boolean;
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */
export default function UserLinks() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<CurrentUser | null>(null);

  const [links, setLinks] = useState<LinkData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);

  const [newLink, setNewLink] = useState<LinkFormData>({
    title: "",
    url: "",
    file_url: "",
    category_id: null,
    color: "",
    image_url: "",
  });
  const [newImageType, setNewImageType] = useState<"url" | "file">("url");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const [newHasFile, setNewHasFile] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [newLinkType, setNewLinkType] = useState<'link' | 'file'>('link');


  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLink, setEditLink] = useState<LinkFormData>({
    title: "",
    url: "",
    file_url: "",
    category_id: null,
    color: "",
    image_url: "",
  });
  const [editImageType, setEditImageType] = useState<"url" | "file">("url");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const [editHasFile, setEditHasFile] = useState(false);
  const [editFile, setEditFile] = useState<File | null>(null);

  const [editLinkType, setEditLinkType] = useState<'link' | 'file'>('link');

  
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user && !user.isAdmin) {
      setNewLinkType('link');
      setNewHasFile(false);
      setNewFile(null);
      setEditLinkType('link');
      setEditHasFile(false);
      setEditFile(null);
    }
  }, [user]);

  /* --------- classe reutilizável de input ------------------------- */
  const fieldClass =
    "p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-[var(--input-background)] text-white";

  const categoryMap = useMemo(() => {
    const map: Record<number, Category> = {};
    for (const c of categories) map[c.id] = c;
    return map;
  }, [categories]);

  /* ---------------------------------------------------------------- */
  const refresh = async () => {
    const [meRes, linkRes, catRes, colorRes, fileRes] = await Promise.all([
      api.get("/auth/me"),
      api.get("/links"),
      api.get("/categories"),
      api.get("/colors"),
      api.get("/schedules"),
    ]);
    setUser(meRes.data as CurrentUser);
    setLinks(
      [...(linkRes.data as LinkData[])].sort((a, b) =>
        a.title.localeCompare(b.title)
      )
    );
    setCategories(
      [...(catRes.data as Category[])].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
    setColors(
      [...(colorRes.data as Color[])].sort((a, b) =>
        (a.name || a.value).localeCompare(b.name || b.value)
      )
    );
    setFiles(fileRes.data as FileItem[]);
  };

  /* ---------------------------------------------------------------- */
  useEffect(() => {
    refresh().catch(() => navigate('/admin/login'));
  }, [navigate]);

  useEffect(() => {
    if (id && links.length) {
      const l = links.find((lnk) => lnk.id === Number(id));
      if (l) {
        setEditingId(l.id);
        setEditLink({
          title: l.title,
          url: l.url,
          file_url: l.fileUrl ?? "",
          category_id: l.categoryId ?? null,
          color: l.color ?? "",
          image_url: l.imageUrl ?? "",
        });
        setEditLinkType(user?.isAdmin && l.fileUrl ? 'file' : 'link');
        setEditImageType("url");
        setEditImageFile(null);
        setEditHasFile(!!l.fileUrl);
        setEditFile(null);
      }
    } else {
      setEditingId(null);
      setEditHasFile(false);
      setEditFile(null);
      setEditLinkType('link');

    }
  }, [id, links]);

  /* ---------------------------------------------------------------- */
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload: LinkFormData = { ...newLink };

      if (newLinkType === 'file' && user?.isAdmin) {
        payload.url = newLink.file_url;
      }

      if (newLinkType === 'link' && newHasFile && newFile) {
        const fd = new FormData();
        fd.append("file", newFile);

        const res = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        payload.file_url = (res.data as { url: string }).url;
      }

      if (newImageType === "file" && newImageFile) {
        const fd = new FormData();
        fd.append("file", newImageFile);
        const res = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        payload.image_url = (res.data as { url: string }).url;
      }
      if (!user?.isAdmin) {
        payload.url = newLink.url;
        delete (payload as any).file_url;
      }
      if (payload.category_id === null) delete (payload as any).category_id;
      if (!payload.file_url) delete (payload as any).file_url;

      await api.post("/links", payload);
      toast.success("Link criado");
      await refresh();

      setNewLink({
        title: "",
        url: "",
        file_url: "",
        category_id: null,
        color: "",
        image_url: "",
      });
      setNewImageFile(null);
      setNewImageType("url");
      setNewFile(null);
      setNewHasFile(false);
      setNewLinkType('link');

    } catch {
      toast.error("Erro ao criar link");
    }
  };

  const startEdit = (link: LinkData) => {
    navigate(`/user/links/${link.id}`);
    setEditingId(link.id);
    setEditLink({
      title: link.title,
      url: link.url,
      file_url: link.fileUrl ?? "",
      category_id: link.categoryId ?? null,
      color: link.color ?? "",
      image_url: link.imageUrl ?? "",
    });
    setEditImageType("url");
    setEditImageFile(null);
    setEditHasFile(!!link.fileUrl);
    setEditFile(null);

  };

  const saveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingId === null) return;
    try {
      const payload: LinkFormData = { ...editLink };

      if (editLinkType === 'file' && user?.isAdmin) {
        payload.url = editLink.file_url;
      }

      if (editLinkType === 'link' && editHasFile && editFile && user?.isAdmin) {
        const fd = new FormData();
        fd.append("file", editFile);

        const res = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        payload.file_url = (res.data as { url: string }).url;
      } else if (editLinkType === 'link' && !editHasFile && user?.isAdmin) {
        payload.file_url = null as any;

      }

      if (editImageType === "file" && editImageFile) {
        const fd = new FormData();
        fd.append("file", editImageFile);
        const res = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        payload.image_url = (res.data as { url: string }).url;
      }
      if (!user?.isAdmin) {
        delete (payload as any).file_url;
      }
      if (payload.category_id === null) delete (payload as any).category_id;
      if (!payload.file_url) delete (payload as any).file_url;

      await api.patch(`/links/${editingId}`, payload);
      toast.success("Link atualizado");
      setEditingId(null);
      setEditImageFile(null);
      setEditImageType("url");
      setEditFile(null);
      setEditHasFile(false);
      setEditLinkType('link');

      await refresh();
      navigate("/user/links");
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const remove = async (linkId: number) => {
    if (!confirm("Excluir link?")) return;
    await api.delete(`/links/${linkId}`);
    await refresh();
  };

  const userLinks = links.filter((l) => l.userId === user?.id);
  const generalLinks = links.filter((l) => l.userId !== user?.id);
  const sortedLinks = [...userLinks].sort((a, b) => a.title.localeCompare(b.title));
  const pageCount = Math.ceil(sortedLinks.length / perPage) || 1;
  const paginatedLinks = sortedLinks.slice((page - 1) * perPage, page * perPage);

  const sidebarContent = (
    <Sidebar>
      <SidebarSection
        icon={<Link2 className="w-3 h-3" style={{ color: 'var(--text-on-dark)' }} />}
        title="Dashboard"
        subtitle="Gerencie seus links"
      >
        <AppNavigation user={user} />
      </SidebarSection>
    </Sidebar>
  );

  return (
    <DashboardLayout
      title="Meus Links"
      subtitle="Gerencie seus links pessoais"
      sidebar={sidebarContent}
      className="grid gap-4 grid-cols-1"
    >
      {/* User Links */}
      <DashboardColumn
        title="Meus Links"
        subtitle={`${userLinks.length} links criados`}
        icon={<Link2 className="w-4 h-4 text-blue-600" />}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        onAdd={() => navigate('/user/links/new')}
        addLabel="Novo Link"
      >
        {paginatedLinks.map((link) => {
          const category = categoryMap[link.categoryId || 0];
          return (
            <ListItem
              key={link.id}
              title={link.title}
              subtitle={link.url || 'Sem URL'}
              icon={Link2}
              iconColor={link.color || category?.color || '#3b82f6'}
              badge={category ? { text: category.name, variant: 'default' } : undefined}
              actions={[
                { icon: ExternalLink, label: 'Abrir', onClick: () => window.open(link.url, '_blank') },
                { icon: Pencil, label: 'Editar', onClick: () => navigate(`/user/links/edit/${link.id}`) },
                { icon: Trash2, label: 'Excluir', onClick: () => remove(link.id), variant: 'danger' }
              ]}
            />
          );
        })}
      </DashboardColumn>
    </DashboardLayout>
  );
}
