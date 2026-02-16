'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import AdminModal from './modal';

type ShareEntityType = 'LINK' | 'SCHEDULE' | 'NOTE';

type ShareRecipient = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

type ShareContentModalProps = {
  open: boolean;
  entityType: ShareEntityType;
  entityId: string | null;
  entityTitle: string;
  onClose: () => void;
  onShared?: () => void | Promise<void>;
};

export default function ShareContentModal({
  open,
  entityType,
  entityId,
  entityTitle,
  onClose,
  onShared,
}: ShareContentModalProps) {
  const [recipients, setRecipients] = useState<ShareRecipient[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedRecipientIds([]);
      setSearch('');
      setError(null);
      return;
    }

    let active = true;
    const loadRecipients = async () => {
      setLoadingRecipients(true);
      setError(null);
      try {
        const response = await api.get('/shares/recipients', {
          skipNotify: true,
        });
        if (!active) return;
        setRecipients(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        if (!active) return;
        const message =
          err?.response?.data?.message || 'Nao foi possivel carregar destinatarios.';
        setError(
          typeof message === 'string'
            ? message
            : 'Erro ao carregar destinatarios.',
        );
      } finally {
        if (active) setLoadingRecipients(false);
      }
    };

    void loadRecipients();
    return () => {
      active = false;
    };
  }, [open]);

  const filteredRecipients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return recipients;
    return recipients.filter((recipient) =>
      `${recipient.name} ${recipient.email}`.toLowerCase().includes(term),
    );
  }, [recipients, search]);

  const toggleRecipient = (recipientId: string) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(recipientId)
        ? prev.filter((id) => id !== recipientId)
        : [...prev, recipientId],
    );
  };

  const submitShare = async () => {
    if (!entityId || selectedRecipientIds.length === 0) return;

    setSaving(true);
    setError(null);
    try {
      await api.post('/shares', {
        entityType,
        entityId,
        recipientIds: selectedRecipientIds,
      });
      if (onShared) {
        await onShared();
      }
      onClose();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Nao foi possivel compartilhar.';
      setError(typeof message === 'string' ? message : 'Erro ao compartilhar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModal
      open={open}
      title="Compartilhar"
      description={`Selecione usuarios para compartilhar "${entityTitle}".`}
      onClose={onClose}
      panelClassName="max-w-2xl"
      footer={
        <>
          <button
            type="button"
            className="rounded-lg border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.18em]"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60"
            onClick={submitShare}
            disabled={saving || !entityId || selectedRecipientIds.length === 0}
          >
            {saving ? 'Compartilhando...' : 'Compartilhar'}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar destinatario por nome ou email"
          className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm"
        />

        <div className="rounded-lg border border-border/70 bg-card/75 px-3 py-2 text-xs text-muted-foreground">
          {selectedRecipientIds.length} destinatario(s) selecionado(s)
        </div>

        {loadingRecipients ? (
          <div className="rounded-lg border border-border/70 bg-card/75 px-4 py-6 text-center text-sm text-muted-foreground">
            Carregando destinatarios...
          </div>
        ) : filteredRecipients.length === 0 ? (
          <div className="rounded-lg border border-border/70 bg-card/75 px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhum destinatario disponivel.
          </div>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {filteredRecipients.map((recipient) => (
              <label
                key={recipient.id}
                className="flex items-start gap-3 rounded-lg border border-border/70 bg-white/80 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedRecipientIds.includes(recipient.id)}
                  onChange={() => toggleRecipient(recipient.id)}
                />
                <span>
                  <p className="font-medium text-foreground">{recipient.name}</p>
                  <p className="text-xs text-muted-foreground">{recipient.email}</p>
                </span>
              </label>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </AdminModal>
  );
}
