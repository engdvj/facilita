'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import UserAvatar from '@/components/user-avatar';
import { getApiErrorMessage } from '@/lib/error';
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    setName(user.name || '');
    setUsername(user.email || '');
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
    } catch {
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
        username: username.trim() || undefined,
        avatarUrl: avatarUrl ?? null,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      const response = await api.patch('/users/me', payload);
      setUser(response.data);
      onClose();
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, 'Erro ao atualizar perfil.'));
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
      description="Atualize suas informações pessoais."
      onClose={onClose}
      panelClassName="max-w-[820px]"
      footer={
        <>
          <button
            type="button"
            className="fac-button-secondary min-w-[120px] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="fac-button-primary min-w-[120px] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleSave}
            disabled={loading || !name.trim() || !username.trim()}
          >
            {loading ? 'Salvando' : 'Salvar'}
          </button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-[168px_minmax(0,1fr)] md:gap-5">
        <div className="fac-form-card flex h-fit flex-col items-center gap-4 p-4">
          <UserAvatar
            name={name}
            avatarUrl={avatarUrl}
            size="lg"
            className="h-24 w-24 text-lg"
          />
          <div className="flex w-full flex-col gap-2">
            <label className="fac-button-secondary motion-press w-full cursor-pointer !h-9 !px-3 text-[10px] disabled:cursor-not-allowed disabled:opacity-60">
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
              className="inline-flex h-9 items-center justify-center rounded-xl text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              disabled={uploading || !avatarUrl}
            >
              Remover foto
            </button>
          </div>
        </div>

        <div className="fac-form-card space-y-4 p-4 md:p-5">
          <AdminField label="Nome" htmlFor="profile-name">
            <input
              id="profile-name"
              className="fac-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
          </AdminField>

          <AdminField label="Usuario" htmlFor="profile-username">
            <input
              id="profile-username"
              type="text"
              className="fac-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="username"
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
              className="fac-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
          </AdminField>

          {error ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-xs text-destructive">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </AdminModal>
  );
}
