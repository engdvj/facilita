'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import UserAvatar from '@/components/user-avatar';
import { useAuthStore } from '@/stores/auth-store';

type UserProfileModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function UserProfileModal({
  open,
  onClose,
}: UserProfileModalProps) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    setName(user.name || '');
    setEmail(user.email || '');
    setPassword('');
    setAvatarUrl(user.avatarUrl ?? null);
    setError(null);
  }, [open, user]);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setUploading(true);
      setError(null);
      const response = await api.post('/uploads/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipNotify: true,
      });
      setAvatarUrl(response.data.url);
    } catch (uploadError) {
      setError('Erro ao fazer upload da imagem.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim() || undefined,
        username: email.trim() || undefined,
        avatarUrl: avatarUrl ?? null,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      const response = await api.patch('/users/me', payload);
      setUser(response.data);
      onClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Nao foi possivel atualizar o perfil.';
      setError(
        typeof message === 'string' ? message : 'Erro ao atualizar perfil.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
  };

  return (
    <AdminModal
      open={open}
      title="Perfil"
      description="Atualize suas informacoes pessoais."
      onClose={onClose}
      panelClassName="max-w-3xl"
      footer={
        <>
          <button
            type="button"
            className="rounded-lg border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.18em] text-foreground"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary-foreground"
            onClick={handleSave}
            disabled={loading || !name.trim() || !email.trim()}
          >
            {loading ? 'Salvando' : 'Salvar'}
          </button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[160px_1fr]">
        <div className="flex flex-col items-center gap-3">
          <UserAvatar
            name={name}
            avatarUrl={avatarUrl}
            size="lg"
            className="h-20 w-20 text-base"
          />
          <label className="motion-press cursor-pointer rounded-full border border-border/70 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition hover:border-foreground/40 hover:text-foreground">
            {uploading ? 'Enviando...' : 'Alterar foto'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </label>
          <button
            type="button"
            onClick={handleRemoveAvatar}
            className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground"
            disabled={uploading}
          >
            Remover foto
          </button>
        </div>

        <div className="space-y-4">
          <AdminField label="Nome" htmlFor="profile-name">
            <input
              id="profile-name"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </AdminField>

          <AdminField label="Usuario" htmlFor="profile-email">
            <input
              id="profile-email"
              type="email"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </AdminField>

          <AdminField
            label="Senha nova"
            htmlFor="profile-password"
            hint="Deixe em branco para manter a senha atual."
          >
            <input
              id="profile-password"
              type="password"
              className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </AdminField>

          {user?.role && (
            <div className="rounded-lg border border-border/70 bg-card/70 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Role
              </p>
              <p className="mt-1 text-sm text-foreground">{user.role}</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>
    </AdminModal>
  );
}
