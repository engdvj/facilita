'use client';

import { Archive, ExternalLink, FileText, Folder, Globe, HardDrive, Home, ImageIcon, Keyboard, LayoutDashboard, Link2, LogOut, Moon, PanelLeftClose, PanelLeftOpen, Search, Settings2, Share2, SquarePen, Star, StickyNote, Trash2, Users, X, type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ConfirmModal from '@/components/admin/confirm-modal';
import AdminField from '@/components/admin/field';
import AdminModal from '@/components/admin/modal';
import AdminPanelHeaderBar from '@/components/admin/panel-header-bar';
import useNotifyOnChange from '@/hooks/use-notify-on-change';
import api from '@/lib/api';
import { backupOptions } from '@/lib/backup';
import { getApiErrorMessage } from '@/lib/error';
import { formatBytes } from '@/lib/format';
import { hasAllPermissions } from '@/lib/permissions';
import {
  BUILTIN_SHORTCUTS,
  buildShortcutCombo,
  formatShortcutInput,
  getKeyboardEventShortcutKeys,
  isActionShortcutTarget,
  isInternalShortcutTarget,
  isShortcutTargetValid,
  mapCustomShortcutToDisplay,
  parseShortcutInput,
  SHORTCUT_ACTIONS,
  type ShortcutDisplayItem,
} from '@/lib/shortcuts';
import { notify } from '@/lib/notify';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import type { CustomShortcut, SystemConfig } from '@/types';

type DraftValue = string | number | boolean;

type AutoBackupFile = {
  name: string;
  size: number;
  updatedAt: string;
};

type ShortcutFormState = {
  title: string;
  description: string;
  context: string;
  keysInput: string;
  target: string;
  openInNewTab: boolean;
};

type ShortcutFormErrors = {
  title?: string;
  keysInput?: string;
  target?: string;
};

type ConfigCategoryMeta = {
  title: string;
  description: string;
  badge: string;
  scope: string;
  icon: LucideIcon;
};

type ConfigGroup = {
  key: string;
  title: string;
  description: string;
  badge: string;
  scope: string;
  icon: LucideIcon;
  kind: 'configs' | 'shortcuts';
  items: SystemConfig[];
  displayCount: number;
  editableCount: number;
  dirtyCount: number;
};

const hiddenConfigKeys = new Set(['initial_superadmin_bootstrapped', 'shortcut_catalog']);
const hiddenConfigCategories = new Set(['system']);

const categoryMeta: Record<string, ConfigCategoryMeta> = {
  backup: {
    title: 'Backup',
    description: 'Agendamento automatico, retencao e exportacao completa da base.',
    badge: 'Rotina critica',
    scope: 'Protecao e recuperacao',
    icon: Archive,
  },
  storage: {
    title: 'Armazenamento',
    description: 'Diretorios padrao usados para uploads e arquivos exportados.',
    badge: 'Infra local',
    scope: 'Arquivos da instancia',
    icon: HardDrive,
  },
  shortcuts: {
    title: 'Atalhos',
    description: 'Comandos rapidos de teclado para acelerar a navegacao no portal.',
    badge: 'Produtividade',
    scope: 'Navegacao e busca',
    icon: Keyboard,
  },
  system: {
    title: 'Sistema',
    description: 'Metadados da instalacao e informacoes estruturais da aplicacao.',
    badge: 'Somente leitura',
    scope: 'Estado da instancia',
    icon: Settings2,
  },
  other: {
    title: 'Outras configuracoes',
    description: 'Ajustes adicionais que nao se encaixam nas categorias principais.',
    badge: 'Geral',
    scope: 'Configuracao complementar',
    icon: Settings2,
  },
};

const configLabels: Record<string, string> = {
  backup_directory: 'Diretorio de backup',
  backup_schedule_enabled: 'Backup automatico',
  backup_schedule_time: 'Horario do backup',
  backup_retention_days: 'Retencao (dias)',
  upload_directory: 'Diretorio de uploads',
  export_directory: 'Diretorio de exportacao',
  install_date: 'Data de instalacao',
  app_version: 'Versao do sistema',
};

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const emptyShortcutForm: ShortcutFormState = {
  title: '',
  description: '',
  context: 'Funciona fora de campos de digitacao.',
  keysInput: '',
  target: '',
  openInNewTab: false,
};

type ShortcutRouteOption = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type ShortcutRouteGroup = {
  label: string;
  options: ShortcutRouteOption[];
};

const SHORTCUT_ROUTE_GROUPS: ShortcutRouteGroup[] = [
  {
    label: 'Navegação',
    options: [
      { href: '/', label: 'Início', icon: Home },
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/favoritos', label: 'Favoritos', icon: Star },
      { href: '/compartilhados', label: 'Compartilhados', icon: Share2 },
    ],
  },
  {
    label: 'Portal',
    options: [
      { href: '/admin/links', label: 'Links', icon: Link2 },
      { href: '/admin/schedules', label: 'Documentos', icon: FileText },
      { href: '/admin/notes', label: 'Notas', icon: StickyNote },
      { href: '/admin/categories', label: 'Categorias', icon: Folder },
      { href: '/admin/images', label: 'Galeria', icon: ImageIcon },
    ],
  },
  {
    label: 'Administração',
    options: [
      { href: '/admin/users', label: 'Usuários', icon: Users },
      { href: '/admin/settings', label: 'Configurações', icon: Settings2 },
      { href: '/admin/backup', label: 'Backup', icon: HardDrive },
    ],
  },
];

const ACTION_ICONS: Record<string, LucideIcon> = {
  'action:open_search': Search,
  'action:toggle_theme': Moon,
  'action:toggle_nav': PanelLeftClose,
  'action:toggle_nav_mode': PanelLeftOpen,
  'action:logout': LogOut,
};

const selectedGroupTone = {
  activeButton:
    'border-primary/60 bg-primary/[0.14] ring-1 ring-primary/25 shadow-[0_12px_28px_rgba(15,22,26,0.14)]',
  rail: 'bg-primary',
  countBadge: 'border-primary/25 bg-primary/[0.12] text-foreground',
  currentBadge:
    'border-primary/60 bg-primary text-primary-foreground shadow-[0_8px_18px_rgba(15,22,26,0.14)]',
};

const parseValue = (config: SystemConfig): DraftValue => {
  switch (config.type) {
    case 'boolean':
      return config.value === 'true';
    case 'number': {
      const parsed = Number(config.value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    default:
      return config.value ?? '';
  }
};

const formatValue = (config: SystemConfig, value: DraftValue) => {
  switch (config.type) {
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      if (value === '') {
        return '';
      }
      return Number.isFinite(Number(value)) ? String(Math.floor(Number(value))) : '';
    default:
      return String(value ?? '');
  }
};

const serializeValue = (config: SystemConfig, value: DraftValue) => {
  switch (config.type) {
    case 'boolean':
      return Boolean(value);
    case 'number':
      return Number(value);
    default:
      return String(value ?? '');
  }
};

const isValidValue = (config: SystemConfig, value: DraftValue) => {
  if (config.type === 'number') {
    if (value === '') {
      return false;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0;
  }

  if (config.type === 'time') {
    return timePattern.test(String(value ?? '').trim());
  }

  if (config.type === 'path' || config.type === 'string') {
    return String(value ?? '').trim().length > 0;
  }

  return true;
};

const getConfigTypeLabel = (type: string) => {
  switch (type) {
    case 'boolean':
      return 'Alternancia';
    case 'number':
      return 'Numero';
    case 'path':
      return 'Caminho';
    case 'time':
      return 'Horario';
    default:
      return 'Texto';
  }
};

const getInputHint = (config: SystemConfig) => {
  switch (config.type) {
    case 'path':
      return 'Use caminho relativo ou absoluto.';
    case 'time':
      return 'Use o formato HH:MM.';
    case 'number':
      return 'Informe um numero inteiro maior ou igual a zero.';
    default:
      return undefined;
  }
};

const getDisplayValue = (config: SystemConfig) => {
  if (config.type === 'boolean') {
    return config.value === 'true' ? 'Ativo' : 'Inativo';
  }

  return config.value || '-';
};

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const globalSearch = useUiStore((state) => state.globalSearch);
  const shortcutCatalog = useUiStore((state) => state.shortcutCatalog);
  const setShortcutCatalog = useUiStore((state) => state.setShortcutCatalog);

  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [drafts, setDrafts] = useState<Record<string, DraftValue>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [selectedGroupKey, setSelectedGroupKey] = useState('backup');
  const [exportingAll, setExportingAll] = useState(false);
  const [autoBackupOpening, setAutoBackupOpening] = useState(false);
  const [autoBackupOpen, setAutoBackupOpen] = useState(false);
  const [autoBackupLoading, setAutoBackupLoading] = useState(false);
  const [autoBackupFiles, setAutoBackupFiles] = useState<AutoBackupFile[]>([]);
  const [autoBackupDirectory, setAutoBackupDirectory] = useState('');
  const [autoBackupError, setAutoBackupError] = useState<string | null>(null);
  const [autoBackupDownloading, setAutoBackupDownloading] = useState('');
  const [shortcutModalOpen, setShortcutModalOpen] = useState(false);
  const [shortcutForm, setShortcutForm] = useState<ShortcutFormState>(emptyShortcutForm);
  const [shortcutFormErrors, setShortcutFormErrors] = useState<ShortcutFormErrors>({});
  const [shortcutEditingId, setShortcutEditingId] = useState<string | null>(null);
  const [shortcutSaving, setShortcutSaving] = useState(false);
  const [isCapturingKeys, setIsCapturingKeys] = useState(false);
  const [shortcutTargetMode, setShortcutTargetMode] = useState<'route' | 'action' | 'external'>('route');
  const [shortcutDeleteTarget, setShortcutDeleteTarget] = useState<CustomShortcut | null>(null);
  const [shortcutRemoving, setShortcutRemoving] = useState(false);

  useNotifyOnChange(error);

  const canManageSettings = hasAllPermissions(user, ['canManageSystemConfig']);

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [configResponse, shortcutResponse] = await Promise.all([
        api.get<SystemConfig[]>('/system-config'),
        api.get<CustomShortcut[]>('/system-config/shortcuts/catalog', {
          skipNotify: true,
        }),
      ]);
      const data = Array.isArray(configResponse.data)
        ? configResponse.data.filter((config) => !hiddenConfigKeys.has(config.key))
        : [];
      const shortcuts = Array.isArray(shortcutResponse.data) ? shortcutResponse.data : [];

      setConfigs(data);
      setDrafts(
        data.reduce<Record<string, DraftValue>>((acc, config) => {
          acc[config.key] = parseValue(config);
          return acc;
        }, {}),
      );
      setShortcutCatalog(shortcuts);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Nao foi possivel carregar configuracoes.'));
    } finally {
      setLoading(false);
    }
  }, [setShortcutCatalog]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!user) {
      setError('Faca login para acessar as configuracoes.');
      setLoading(false);
      return;
    }

    if (!canManageSettings) {
      setError('Acesso restrito.');
      setLoading(false);
      return;
    }

    void loadConfigs();
  }, [canManageSettings, hasHydrated, loadConfigs, user]);

  const shortcutItems = useMemo(
    () => [...BUILTIN_SHORTCUTS, ...shortcutCatalog.map((shortcut) => mapCustomShortcutToDisplay(shortcut))],
    [shortcutCatalog],
  );

  const groupedConfigs = useMemo(() => {
    const groups = new Map<string, SystemConfig[]>();

    configs.forEach((config) => {
      const category = config.category?.trim() || 'other';
      if (hiddenConfigCategories.has(category)) {
        return;
      }
      const current = groups.get(category) ?? [];
      current.push(config);
      groups.set(category, current);
    });

    const configGroups = Array.from(groups.keys()).map((key) => {
      const meta = categoryMeta[key] ?? categoryMeta.other;
      return {
        key,
        ...meta,
        kind: 'configs' as const,
        items: (groups.get(key) ?? []).sort((left, right) => left.key.localeCompare(right.key)),
        displayCount: 0,
        editableCount: 0,
        dirtyCount: 0,
      };
    });

    const shortcutMeta = categoryMeta.shortcuts;
    return [
      ...configGroups,
      {
        key: 'shortcuts',
        ...shortcutMeta,
        kind: 'shortcuts' as const,
        items: [],
        displayCount: shortcutItems.length,
        editableCount: 0,
        dirtyCount: 0,
      },
    ].sort((left, right) => left.title.localeCompare(right.title, 'pt-BR'));
  }, [configs, shortcutItems.length]);

  const activeSearch = globalSearch.trim();

  const visibleGroups = useMemo(() => {
    const term = activeSearch.toLowerCase();
    return groupedConfigs.reduce<ConfigGroup[]>((acc, group) => {
      if (group.kind === 'shortcuts') {
        const shortcutMatches =
          !term ||
          `${group.title} ${group.description} ${group.scope} ${group.badge} ${shortcutItems
            .map(
              (shortcut) =>
                `${shortcut.title} ${shortcut.keys.join(' ')} ${shortcut.keys.join(' + ')} ${shortcut.description} ${shortcut.context}`,
            )
            .join(' ')}`
            .toLowerCase()
            .includes(term);

        if (shortcutMatches) {
          acc.push({
            ...group,
            displayCount: shortcutItems.length,
            editableCount: 0,
            dirtyCount: 0,
          });
        }

        return acc;
      }

      const groupMatches =
        !term ||
        `${group.title} ${group.description} ${group.scope} ${group.badge}`
          .toLowerCase()
          .includes(term);

      const items = group.items.filter((config) => {
        if (groupMatches) {
          return true;
        }

        const label = configLabels[config.key] || config.key;
        return `${label} ${config.description ?? ''} ${config.key}`
          .toLowerCase()
          .includes(term);
      });

      if (items.length > 0) {
        acc.push({
          ...group,
          items,
          displayCount: items.length,
          editableCount: items.filter((config) => config.isEditable).length,
          dirtyCount: items.reduce((total, config) => {
            const draft = drafts[config.key] ?? parseValue(config);
            return total + (formatValue(config, draft) !== config.value ? 1 : 0);
          }, 0),
        });
      }

      return acc;
    }, []);
  }, [activeSearch, drafts, groupedConfigs, shortcutItems]);

  const selectedGroup = useMemo(
    () =>
      visibleGroups.find((group) => group.key === selectedGroupKey) ??
      visibleGroups[0] ??
      null,
    [selectedGroupKey, visibleGroups],
  );

  useEffect(() => {
    if (visibleGroups.length === 0) {
      return;
    }

    const hasSelectedGroup = visibleGroups.some((group) => group.key === selectedGroupKey);
    if (!hasSelectedGroup) {
      setSelectedGroupKey(visibleGroups[0].key);
    }
  }, [selectedGroupKey, visibleGroups]);

  const createShortcutId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `shortcut-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  };

  const closeShortcutModal = () => {
    setShortcutModalOpen(false);
    setShortcutEditingId(null);
    setShortcutForm({ ...emptyShortcutForm });
    setShortcutFormErrors({});
    setShortcutTargetMode('route');
  };

  const openCreateShortcut = () => {
    setShortcutEditingId(null);
    setShortcutForm({ ...emptyShortcutForm });
    setShortcutFormErrors({});
    setShortcutTargetMode('route');
    setShortcutModalOpen(true);
  };

  const openEditShortcut = (shortcut: CustomShortcut) => {
    setShortcutEditingId(shortcut.id);
    setShortcutForm({
      title: shortcut.title,
      description: shortcut.description,
      context: shortcut.context,
      keysInput: formatShortcutInput(shortcut.keys),
      target: shortcut.target,
      openInNewTab: shortcut.openInNewTab,
    });
    setShortcutFormErrors({});
    setShortcutTargetMode(
      isActionShortcutTarget(shortcut.target) ? 'action'
      : shortcut.target.startsWith('/') ? 'route'
      : 'external'
    );
    setShortcutModalOpen(true);
  };

  const buildShortcutFromForm = () => {
    const nextErrors: ShortcutFormErrors = {};
    const title = shortcutForm.title.trim();
    const keys = parseShortcutInput(shortcutForm.keysInput);
    const target = shortcutForm.target.trim();

    if (!title) {
      nextErrors.title = 'Titulo obrigatorio.';
    }

    if (!keys) {
      nextErrors.keysInput = 'Use um formato como Ctrl + Shift + K.';
    }

    if (!isShortcutTargetValid(target)) {
      nextErrors.target = 'Use uma rota iniciando com / ou uma URL http(s).';
    }

    if (Object.keys(nextErrors).length > 0) {
      setShortcutFormErrors(nextErrors);
      return null;
    }

    if (!keys) {
      return null;
    }

    const combo = buildShortcutCombo(keys);
    const conflictingShortcut = shortcutItems.find(
      (shortcut) =>
        buildShortcutCombo(shortcut.keys) === combo &&
        (shortcut.source === 'system' || shortcut.id !== shortcutEditingId),
    );

    if (conflictingShortcut) {
      setShortcutFormErrors({
        keysInput:
          conflictingShortcut.source === 'system'
            ? 'Essa combinacao ja e reservada pelo sistema.'
            : 'Essa combinacao ja esta cadastrada.',
      });
      return null;
    }

    return {
      id: shortcutEditingId ?? createShortcutId(),
      title,
      description:
        shortcutForm.description.trim() || `Abre ${isInternalShortcutTarget(target) ? 'uma rota interna' : 'um destino externo'}.`,
      context: shortcutForm.context.trim() || 'Funciona fora de campos de digitacao.',
      keys,
      target,
      openInNewTab: shortcutForm.openInNewTab,
    } satisfies CustomShortcut;
  };

  const persistShortcutCatalog = async (
    nextCatalog: CustomShortcut[],
    successMessage: string,
    fallbackMessage: string,
  ) => {
    try {
      const response = await api.patch<CustomShortcut[]>(
        '/system-config/shortcuts/catalog',
        { items: nextCatalog },
        { skipNotify: true },
      );
      const savedCatalog = Array.isArray(response.data) ? response.data : [];
      setShortcutCatalog(savedCatalog);
      notify.success(successMessage);
      return true;
    } catch (err: unknown) {
      notify.error(getApiErrorMessage(err, fallbackMessage));
      return false;
    }
  };

  const handleSaveShortcut = async () => {
    const shortcut = buildShortcutFromForm();

    if (!shortcut) {
      return;
    }

    const nextCatalog = shortcutEditingId
      ? shortcutCatalog.map((item) => (item.id === shortcutEditingId ? shortcut : item))
      : [...shortcutCatalog, shortcut];

    setShortcutSaving(true);

    const saved = await persistShortcutCatalog(
      nextCatalog,
      shortcutEditingId ? 'Atalho atualizado com sucesso.' : 'Atalho criado com sucesso.',
      'Erro ao salvar atalho.',
    );

    if (saved) {
      closeShortcutModal();
    }

    setShortcutSaving(false);
  };

  const handleRemoveShortcut = async () => {
    if (!shortcutDeleteTarget) {
      return;
    }

    setShortcutRemoving(true);

    const saved = await persistShortcutCatalog(
      shortcutCatalog.filter((shortcut) => shortcut.id !== shortcutDeleteTarget.id),
      'Atalho removido com sucesso.',
      'Erro ao remover atalho.',
    );

    if (saved) {
      setShortcutDeleteTarget(null);
    }

    setShortcutRemoving(false);
  };

  const handleDraftChange = (key: string, value: DraftValue) => {
    setDrafts((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async (config: SystemConfig) => {
    const value = drafts[config.key];

    if (!isValidValue(config, value)) {
      notify.error('Valor invalido para esta configuracao.');
      return;
    }

    setSaving((current) => ({ ...current, [config.key]: true }));

    try {
      const response = await api.patch<SystemConfig>(`/system-config/${config.key}`, {
        value: serializeValue(config, value),
      });
      const updated = response.data;

      setConfigs((current) =>
        current.map((item) => (item.key === updated.key ? updated : item)),
      );
      setDrafts((current) => ({
        ...current,
        [updated.key]: parseValue(updated),
      }));
    } catch (err: unknown) {
      notify.error(getApiErrorMessage(err, 'Erro ao salvar configuracao.'));
    } finally {
      setSaving((current) => ({ ...current, [config.key]: false }));
    }
  };

  const handleExportAll = async () => {
    setExportingAll(true);

    try {
      const response = await api.post(
        '/backups/export',
        { entities: backupOptions.map((option) => option.key) },
        { responseType: 'blob', skipNotify: true },
      );
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);

      anchor.href = url;
      anchor.download = `facilita-backup-${date}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      notify.success('Backup gerado com sucesso.');
    } catch (err: unknown) {
      notify.error(getApiErrorMessage(err, 'Erro ao gerar backup.'));
    } finally {
      setExportingAll(false);
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const loadAutoBackups = async () => {
    setAutoBackupLoading(true);
    setAutoBackupError(null);

    try {
      const response = await api.get('/backups/auto');
      const data = response.data as {
        directory?: string;
        files?: AutoBackupFile[];
      };

      setAutoBackupDirectory(data.directory ?? '');
      setAutoBackupFiles(Array.isArray(data.files) ? data.files : []);
    } catch (err: unknown) {
      setAutoBackupError(getApiErrorMessage(err, 'Erro ao carregar backups automaticos.'));
    } finally {
      setAutoBackupLoading(false);
    }
  };

  const handleOpenAutoBackups = async () => {
    setAutoBackupOpening(true);
    setAutoBackupOpen(true);
    await loadAutoBackups();
    setAutoBackupOpening(false);
  };

  const handleDownloadAutoBackup = async (name: string) => {
    if (!name) {
      return;
    }

    setAutoBackupDownloading(name);

    try {
      const response = await api.get(`/backups/auto/files/${encodeURIComponent(name)}`, {
        responseType: 'blob',
        skipNotify: true,
      });
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      notify.error(getApiErrorMessage(err, 'Erro ao baixar backup.'));
    } finally {
      setAutoBackupDownloading('');
    }
  };

  const renderConfigCard = (config: SystemConfig) => {
    const value = drafts[config.key] ?? parseValue(config);
    const formattedValue = formatValue(config, value);
    const dirty = formattedValue !== config.value;
    const valid = isValidValue(config, value);
    const isSaving = Boolean(saving[config.key]);
    const label = configLabels[config.key] || config.key;
    const inputId = `system-config-${config.key}`;

    return (
      <section
        key={config.key}
        className="rounded-[18px] border border-border bg-white/55 p-4 dark:bg-secondary/55"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border border-border/80 bg-background/55 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {getConfigTypeLabel(config.type)}
                </span>

                {!config.isEditable ? (
                  <span className="inline-flex rounded-full border border-border/80 bg-background/55 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Somente leitura
                  </span>
                ) : null}

                {dirty && config.isEditable ? (
                  <span className="inline-flex rounded-full border border-amber-600/30 bg-amber-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                    Alteracoes pendentes
                  </span>
                ) : null}

                {!valid && dirty && config.isEditable ? (
                  <span className="inline-flex rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-rose-600 dark:text-rose-300">
                    Valor invalido
                  </span>
                ) : null}
              </div>

              <div>
                <h3 className="text-[16px] font-semibold text-foreground">{label}</h3>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {config.description || config.key}
                </p>
              </div>
            </div>

            <div className="rounded-[14px] border border-border/80 bg-background/55 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Chave
              </p>
              <p className="mt-1 text-[11px] font-medium text-foreground">{config.key}</p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <div>
              {config.isEditable ? (
                <AdminField label="Valor" htmlFor={inputId} hint={getInputHint(config)}>
                  {config.type === 'boolean' ? (
                    <div className="rounded-[16px] border border-border/70 bg-card/80 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">
                            {Boolean(value) ? 'Ativado' : 'Desativado'}
                          </p>
                          <p className="mt-1 text-[12px] text-muted-foreground">
                            {Boolean(value)
                              ? 'A configuracao esta habilitada.'
                              : 'A configuracao esta desligada.'}
                          </p>
                        </div>

                        <button
                          type="button"
                          className={`fac-toggle shrink-0 ${
                            isSaving ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                          data-state={Boolean(value) ? 'on' : 'off'}
                          onClick={() => handleDraftChange(config.key, !Boolean(value))}
                          disabled={isSaving}
                          aria-pressed={Boolean(value)}
                          aria-label={`${Boolean(value) ? 'Desativar' : 'Ativar'} ${label}`}
                        >
                          <span className="fac-toggle-dot" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <input
                      id={inputId}
                      type={
                        config.type === 'number'
                          ? 'number'
                          : config.type === 'time'
                            ? 'time'
                            : 'text'
                      }
                      min={config.type === 'number' ? 0 : undefined}
                      step={config.type === 'number' ? 1 : undefined}
                      value={String(value ?? '')}
                      onChange={(event) => {
                        const nextValue =
                          config.type === 'number'
                            ? event.target.value === ''
                              ? ''
                              : Number(event.target.value)
                            : event.target.value;
                        handleDraftChange(config.key, nextValue);
                      }}
                      className={`fac-input ${
                        !valid && dirty ? 'border-rose-500/40 ring-1 ring-rose-500/20' : ''
                      }`}
                      disabled={isSaving}
                    />
                  )}
                </AdminField>
              ) : (
                <div className="rounded-[16px] border border-border/70 bg-card/80 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Valor atual
                  </p>
                  <p className="mt-2 text-[13px] font-semibold text-foreground">
                    {getDisplayValue(config)}
                  </p>
                </div>
              )}
            </div>

            {config.isEditable ? (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  className="fac-button-primary text-[11px]"
                  onClick={() => handleSave(config)}
                  disabled={!dirty || !valid || isSaving}
                >
                  {isSaving ? 'Salvando...' : 'Salvar ajuste'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  };

  const renderShortcutCard = (shortcut: ShortcutDisplayItem) => (
    <section
      key={shortcut.id}
      className="rounded-[18px] border border-border bg-white/55 p-4 dark:bg-secondary/55"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full border border-border/80 bg-background/55 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {shortcut.source === 'system' ? 'Atalho global' : 'Atalho personalizado'}
              </span>

              {shortcut.source === 'custom' ? (
                <span className="inline-flex rounded-full border border-primary/20 bg-primary/[0.08] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground">
                  {shortcut.openInNewTab ? 'Nova aba' : 'Mesma aba'}
                </span>
              ) : null}
            </div>

            <h3 className="mt-3 text-[16px] font-semibold text-foreground">{shortcut.title}</h3>
            <p className="mt-1 text-[12px] text-muted-foreground">{shortcut.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {shortcut.keys.map((key, index) => (
              <div key={`${shortcut.id}-${key}`} className="flex items-center gap-2">
                <span className="inline-flex min-w-[38px] items-center justify-center rounded-[12px] border border-border/80 bg-background/75 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground shadow-[0_4px_10px_rgba(15,22,26,0.08)]">
                  {key}
                </span>
                {index < shortcut.keys.length - 1 ? (
                  <span className="text-[12px] font-semibold text-muted-foreground">+</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[16px] border border-border/70 bg-card/80 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Quando usar
            </p>
            <p className="mt-2 text-[13px] text-foreground">{shortcut.context}</p>
          </div>

          <div className="rounded-[16px] border border-border/70 bg-card/80 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Acao
            </p>
            <p className="mt-2 text-[13px] text-foreground">
              {shortcut.actionKind === 'GLOBAL_SEARCH'
                ? 'Abre a busca global.'
                : shortcut.target}
            </p>
            {shortcut.actionKind === 'TARGET' ? (
              <p className="mt-2 text-[11px] text-muted-foreground">
                {isInternalShortcutTarget(shortcut.target ?? '')
                  ? 'Navega para uma rota interna.'
                  : 'Abre um destino externo.'}
              </p>
            ) : null}
          </div>
        </div>

        {shortcut.source === 'custom' ? (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="fac-button-secondary !h-9 !px-4 text-[10px]"
              onClick={() => {
                const editableShortcut = shortcutCatalog.find((item) => item.id === shortcut.id);
                if (editableShortcut) {
                  openEditShortcut(editableShortcut);
                }
              }}
            >
              <SquarePen className="h-3.5 w-3.5" />
              Editar
            </button>

            <button
              type="button"
              className="fac-button-secondary !h-9 !px-4 text-[10px] !border-destructive/40 !bg-destructive/5 !text-destructive hover:!bg-destructive/10"
              onClick={() => {
                const removableShortcut = shortcutCatalog.find((item) => item.id === shortcut.id);
                if (removableShortcut) {
                  setShortcutDeleteTarget(removableShortcut);
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remover
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );

  const renderShortcutModal = () => {
    const parsedKeys = parseShortcutInput(shortcutForm.keysInput);

    return (
      <AdminModal
        open={shortcutModalOpen}
        title={shortcutEditingId ? 'Editar atalho' : 'Novo atalho'}
        description={shortcutEditingId ? 'Altere os campos que desejar e salve.' : 'Defina um nome, as teclas e para onde o atalho leva.'}
        onClose={shortcutSaving ? () => undefined : closeShortcutModal}
        panelClassName="max-w-lg"
        footer={
          <>
            <button
              type="button"
              className="fac-button-secondary text-[11px]"
              onClick={closeShortcutModal}
              disabled={shortcutSaving}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="fac-button-primary text-[11px]"
              onClick={handleSaveShortcut}
              disabled={shortcutSaving}
            >
              {shortcutSaving ? 'Salvando...' : shortcutEditingId ? 'Salvar' : 'Criar atalho'}
            </button>
          </>
        }
      >
        <div className="space-y-5">

          {/* Título */}
          <AdminField label="Nome do atalho" htmlFor="shortcut-title">
            <div className="space-y-1.5">
              <input
                id="shortcut-title"
                type="text"
                value={shortcutForm.title}
                onChange={(event) =>
                  setShortcutForm((current) => ({ ...current, title: event.target.value }))
                }
                className={`fac-input ${shortcutFormErrors.title ? 'border-rose-500/40 ring-1 ring-rose-500/20' : ''}`}
                disabled={shortcutSaving}
                placeholder="Ex.: Abrir links, Ir para o início"
                autoFocus
              />
              {shortcutFormErrors.title ? (
                <p className="text-[12px] text-rose-600">{shortcutFormErrors.title}</p>
              ) : null}
            </div>
          </AdminField>

          {/* Captura de teclas */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Combinação de teclas
            </p>

            <div
              role="button"
              tabIndex={shortcutSaving ? -1 : 0}
              aria-label="Campo de captura de teclas"
              className={[
                'relative flex min-h-[52px] cursor-pointer items-center justify-between gap-3 rounded-[10px] border px-4 py-3 transition select-none outline-none',
                isCapturingKeys
                  ? 'border-primary/50 bg-primary/[0.04] ring-2 ring-primary/20'
                  : shortcutFormErrors.keysInput
                    ? 'border-rose-500/40 bg-card/80 ring-1 ring-rose-500/20'
                    : 'border-border/70 bg-card/80 hover:border-border',
              ].join(' ')}
              onFocus={() => setIsCapturingKeys(true)}
              onBlur={() => setIsCapturingKeys(false)}
              onKeyDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const keys = getKeyboardEventShortcutKeys(event.nativeEvent);
                if (keys) {
                  setShortcutForm((current) => ({ ...current, keysInput: formatShortcutInput(keys) }));
                  setShortcutFormErrors((current) => ({ ...current, keysInput: undefined }));
                }
              }}
            >
              {parsedKeys ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {parsedKeys.map((key) => (
                    <kbd
                      key={key}
                      className="inline-flex items-center rounded-[7px] border border-border bg-background px-2.5 py-1 font-mono text-[12px] font-semibold text-foreground shadow-[0_2px_0_rgba(0,0,0,0.12)]"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              ) : (
                <span className={`text-[13px] ${isCapturingKeys ? 'animate-pulse text-primary' : 'text-muted-foreground/60'}`}>
                  {isCapturingKeys ? 'Pressione as teclas agora...' : 'Clique aqui e pressione as teclas'}
                </span>
              )}

              {parsedKeys ? (
                <button
                  type="button"
                  tabIndex={-1}
                  className="shrink-0 rounded-md p-1 text-muted-foreground/50 hover:bg-muted hover:text-foreground transition"
                  onClick={(event) => {
                    event.stopPropagation();
                    setShortcutForm((current) => ({ ...current, keysInput: '' }));
                  }}
                  aria-label="Limpar combinação"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            {shortcutFormErrors.keysInput ? (
              <p className="text-[12px] text-rose-600">{shortcutFormErrors.keysInput}</p>
            ) : isCapturingKeys ? (
              <p className="text-[12px] text-primary/70">
                Use pelo menos um modificador (Ctrl, Alt, Shift) + uma tecla.
              </p>
            ) : parsedKeys ? null : (
              <p className="text-[12px] text-muted-foreground">
                Ex.: Ctrl + Shift + K, Alt + L
              </p>
            )}
          </div>

          {/* Destino */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Destino
            </p>

            <div className={`space-y-3 rounded-[12px] border p-4 ${shortcutFormErrors.target ? 'border-rose-500/40 ring-1 ring-rose-500/20' : 'border-border/60 bg-card/50'}`}>

              {/* Rotas */}
              {SHORTCUT_ROUTE_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((option) => {
                      const Icon = option.icon;
                      const isSelected = shortcutTargetMode === 'route' && shortcutForm.target === option.href;
                      return (
                        <button
                          key={option.href}
                          type="button"
                          disabled={shortcutSaving}
                          onClick={() => {
                            setShortcutTargetMode('route');
                            setShortcutForm((c) => ({ ...c, target: option.href }));
                            setShortcutFormErrors((c) => ({ ...c, target: undefined }));
                          }}
                          className={[
                            'inline-flex items-center gap-1.5 rounded-[8px] border px-3 py-1.5 text-[12px] font-medium transition',
                            isSelected
                              ? 'border-primary/50 bg-primary text-primary-foreground shadow-[0_6px_14px_rgba(15,22,26,0.18)]'
                              : 'border-border/60 bg-background/70 text-foreground hover:border-primary/30 hover:bg-primary/[0.06]',
                          ].join(' ')}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Ações */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                  Ações
                </p>
                <div className="flex flex-wrap gap-2">
                  {SHORTCUT_ACTIONS.map((action) => {
                    const Icon = ACTION_ICONS[action.id];
                    const isSelected = shortcutTargetMode === 'action' && shortcutForm.target === action.id;
                    return (
                      <button
                        key={action.id}
                        type="button"
                        disabled={shortcutSaving}
                        title={action.description}
                        onClick={() => {
                          setShortcutTargetMode('action');
                          setShortcutForm((c) => ({ ...c, target: action.id, openInNewTab: false }));
                          setShortcutFormErrors((c) => ({ ...c, target: undefined }));
                        }}
                        className={[
                          'inline-flex items-center gap-1.5 rounded-[8px] border px-3 py-1.5 text-[12px] font-medium transition',
                          isSelected
                            ? 'border-primary/50 bg-primary text-primary-foreground shadow-[0_6px_14px_rgba(15,22,26,0.18)]'
                            : 'border-border/60 bg-background/70 text-foreground hover:border-primary/30 hover:bg-primary/[0.06]',
                        ].join(' ')}
                      >
                        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* URL externa */}
              <div className="pt-1">
                <div className="mb-3 h-px bg-border/50" />
                <button
                  type="button"
                  disabled={shortcutSaving}
                  onClick={() => {
                    setShortcutTargetMode('external');
                    setShortcutForm((c) => ({ ...c, target: '', openInNewTab: true }));
                    setShortcutFormErrors((c) => ({ ...c, target: undefined }));
                  }}
                  className={[
                    'inline-flex items-center gap-1.5 rounded-[8px] border px-3 py-1.5 text-[12px] font-medium transition',
                    shortcutTargetMode === 'external'
                      ? 'border-primary/50 bg-primary text-primary-foreground shadow-[0_6px_14px_rgba(15,22,26,0.18)]'
                      : 'border-border/60 bg-background/70 text-foreground hover:border-primary/30 hover:bg-primary/[0.06]',
                  ].join(' ')}
                >
                  <Globe className="h-3.5 w-3.5" />
                  URL externa
                </button>

                {shortcutTargetMode === 'external' ? (
                  <div className="mt-2.5">
                    <div className="relative">
                      <input
                        type="text"
                        value={shortcutForm.target}
                        onChange={(event) =>
                          setShortcutForm((c) => ({ ...c, target: event.target.value }))
                        }
                        className="fac-input pl-9 text-[13px]"
                        disabled={shortcutSaving}
                        placeholder="https://exemplo.com"
                        autoFocus
                      />
                      <ExternalLink className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                    </div>
                  </div>
                ) : null}
              </div>

            </div>

            {shortcutFormErrors.target ? (
              <p className="text-[12px] text-rose-600">{shortcutFormErrors.target}</p>
            ) : null}
          </div>

          {/* Nova aba — compact toggle row (hidden for actions) */}
          {shortcutTargetMode === 'action' ? null : (
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[10px] border border-border/60 bg-card/60 px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-foreground">Abrir em nova aba</p>
              <p className="text-[12px] text-muted-foreground">
                {shortcutForm.openInNewTab ? 'A página atual permanece aberta.' : 'Navega na aba atual.'}
              </p>
            </div>
            <button
              type="button"
              className={`fac-toggle shrink-0 ${shortcutSaving ? 'cursor-not-allowed opacity-50' : ''}`}
              data-state={shortcutForm.openInNewTab ? 'on' : 'off'}
              onClick={() =>
                setShortcutForm((current) => ({ ...current, openInNewTab: !current.openInNewTab }))
              }
              disabled={shortcutSaving}
              aria-pressed={shortcutForm.openInNewTab}
              aria-label="Alternar abertura em nova aba"
            >
              <span className="fac-toggle-dot" />
            </button>
          </label>
          )}

          {/* Descrição — optional */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Descrição <span className="normal-case tracking-normal font-normal">(opcional)</span>
            </p>
            <input
              id="shortcut-description"
              type="text"
              value={shortcutForm.description}
              onChange={(event) =>
                setShortcutForm((current) => ({ ...current, description: event.target.value }))
              }
              className="fac-input"
              disabled={shortcutSaving}
              placeholder="Ex.: Abre a tela de gerenciamento de links."
            />
          </div>

        </div>
      </AdminModal>
    );
  };

  const renderAutoBackupModal = () => (
    <AdminModal
      open={autoBackupOpen}
      title="Backups automaticos"
      description="Arquivos gerados pelo agendamento."
      onClose={() => setAutoBackupOpen(false)}
      panelClassName="max-w-2xl"
      footer={
        <button
          type="button"
          className="fac-button-secondary text-[11px]"
          onClick={loadAutoBackups}
          disabled={autoBackupLoading}
        >
          {autoBackupLoading ? 'Atualizando...' : 'Atualizar lista'}
        </button>
      }
    >
      {autoBackupDirectory ? (
        <div className="rounded-[16px] border border-border/70 bg-card/80 px-4 py-3 text-[12px] text-muted-foreground">
          Diretorio: <span className="text-foreground">{autoBackupDirectory}</span>
        </div>
      ) : null}

      {autoBackupLoading ? (
        <div className="fac-loading-state !px-4 !py-6">Carregando backups automaticos...</div>
      ) : autoBackupError ? (
        <div className="fac-error-state !px-4 !py-6">{autoBackupError}</div>
      ) : autoBackupFiles.length === 0 ? (
        <div className="fac-empty-state !px-4 !py-6">Nenhum backup automatico encontrado.</div>
      ) : (
        <div className="space-y-2">
          {autoBackupFiles.map((file) => (
            <div
              key={file.name}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-border/70 bg-card/80 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-foreground">{file.name}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {formatBytes(file.size, 1)} · {formatDate(file.updatedAt)}
                </p>
              </div>

              <button
                type="button"
                className="fac-button-secondary !h-9 !px-4 text-[10px]"
                onClick={() => handleDownloadAutoBackup(file.name)}
                disabled={autoBackupDownloading === file.name}
              >
                {autoBackupDownloading === file.name ? 'Baixando...' : 'Baixar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminModal>
  );

  return (
    <div className="fac-page">
      <section className="fac-panel">
        <AdminPanelHeaderBar title="Configuracoes" count={visibleGroups.length} />

        <div className="fac-panel-body space-y-4">
          {activeSearch ? (
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
              Busca ativa:{' '}
              <span className="normal-case tracking-normal text-foreground">{activeSearch}</span>
            </p>
          ) : null}

          {loading ? (
            <div className="fac-loading-state">Carregando configuracoes...</div>
          ) : error ? (
            <div className="fac-error-state">{error}</div>
          ) : visibleGroups.length === 0 ? (
            <div className="fac-empty-state">Nenhuma configuracao encontrada.</div>
          ) : (
            <div className="grid gap-4">
              <section className="fac-form-card">
                <div className="grid gap-3 md:grid-cols-3">
                  {visibleGroups.map((group) => {
                    const Icon = group.icon;
                    const isActive = selectedGroup?.key === group.key;

                    return (
                      <button
                        key={`selector-${group.key}`}
                        type="button"
                        className={`relative overflow-hidden flex items-center justify-between gap-3 rounded-[16px] border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                          isActive
                            ? selectedGroupTone.activeButton
                            : 'border-border bg-white/55 hover:border-primary/30 hover:bg-white/75 dark:bg-secondary/55 dark:hover:bg-secondary'
                        }`}
                        onClick={() => setSelectedGroupKey(group.key)}
                        aria-pressed={isActive}
                      >
                        {isActive ? (
                          <span
                            aria-hidden="true"
                            className={`absolute inset-y-2 left-2 w-1 rounded-full ${selectedGroupTone.rail}`}
                          />
                        ) : null}

                        <span className="min-w-0 flex flex-1 items-center gap-3">
                          <span
                            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                              isActive
                                ? 'border-primary/20 bg-primary/[0.12] text-foreground'
                                : 'border-border/80 bg-background/55 text-muted-foreground'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>

                          <span className="min-w-0">
                            <span className="block text-[16px] font-display leading-none text-foreground">
                              {group.title}
                            </span>
                            <span
                              className={`mt-1 block text-[11px] ${
                                isActive ? 'text-foreground/80' : 'text-muted-foreground'
                              }`}
                            >
                              {group.scope}
                            </span>
                          </span>
                        </span>

                        <span className="flex shrink-0 items-center gap-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                              isActive
                                ? selectedGroupTone.countBadge
                                : 'border-border/80 bg-background/55 text-muted-foreground'
                            }`}
                          >
                            {group.displayCount} {group.kind === 'shortcuts' ? 'atalhos' : 'itens'}
                          </span>

                          {group.dirtyCount > 0 ? (
                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-amber-600/30 bg-amber-500/10 px-2 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                              {group.dirtyCount}
                            </span>
                          ) : null}

                          {isActive ? (
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${selectedGroupTone.currentBadge}`}
                            >
                              Atual
                            </span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-4 text-[13px] text-muted-foreground">
                  Revise uma categoria por vez, valide o impacto operacional e salve apenas o que
                  foi alterado.
                </p>
              </section>

              {selectedGroup ? (
                <section className="fac-form-card">
                  <div className="flex flex-col gap-4 border-b border-border/70 pb-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/[0.08] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground">
                          {selectedGroup.badge}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${
                            selectedGroup.kind === 'shortcuts'
                              ? 'border-border/80 bg-background/55 text-muted-foreground'
                              : selectedGroup.dirtyCount > 0
                              ? 'border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                              : 'border-border/80 bg-background/55 text-muted-foreground'
                          }`}
                        >
                          {selectedGroup.kind === 'shortcuts'
                            ? 'Catalogado'
                            : selectedGroup.dirtyCount > 0
                              ? 'Alterado'
                              : 'Sincronizado'}
                        </span>
                      </div>

                      <div className="flex min-w-0 items-start gap-3">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/[0.08] text-foreground">
                          <selectedGroup.icon className="h-5 w-5" />
                        </span>

                        <div className="min-w-0">
                          <h2 className="text-[24px] font-display leading-none text-foreground">
                            {selectedGroup.title}
                          </h2>
                          <p className="mt-2 max-w-2xl text-[13px] text-muted-foreground">
                            {selectedGroup.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[380px]">
                      {[
                        {
                          label: selectedGroup.kind === 'shortcuts' ? 'Atalhos' : 'Itens',
                          value: String(selectedGroup.displayCount),
                          hint:
                            selectedGroup.kind === 'shortcuts'
                              ? 'Comandos rapidos documentados nesta aba.'
                              : 'Configuracoes visiveis nesta categoria.',
                        },
                        {
                          label: selectedGroup.kind === 'shortcuts' ? 'Escopo' : 'Editaveis',
                          value:
                            selectedGroup.kind === 'shortcuts'
                              ? 'Global'
                              : String(selectedGroup.editableCount),
                          hint:
                            selectedGroup.kind === 'shortcuts'
                              ? 'Disponiveis durante a navegacao do sistema.'
                              : selectedGroup.editableCount > 0
                              ? 'Podem ser atualizadas por aqui.'
                              : 'Apenas informacoes de leitura.',
                        },
                        {
                          label: selectedGroup.kind === 'shortcuts' ? 'Entrada' : 'Pendencias',
                          value:
                            selectedGroup.kind === 'shortcuts'
                              ? 'Teclado'
                              : String(selectedGroup.dirtyCount),
                          hint:
                            selectedGroup.kind === 'shortcuts'
                              ? 'Acionados por combinacoes de teclas.'
                              : selectedGroup.dirtyCount > 0
                              ? 'Ha alteracoes locais ainda nao salvas.'
                              : 'Nenhuma alteracao pendente.',
                        },
                      ].map((item) => (
                        <div
                          key={`${selectedGroup.key}-${item.label}`}
                          className="rounded-[16px] border border-border bg-white/55 px-3 py-3 dark:bg-secondary/55"
                        >
                          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                            {item.label}
                          </p>
                          <p className="mt-2 text-[14px] font-semibold text-foreground">
                            {item.value}
                          </p>
                          <p className="mt-2 text-[11px] text-muted-foreground">{item.hint}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedGroup.key === 'backup' ? (
                    <div className="mt-4 flex flex-col gap-3 rounded-[18px] border border-border bg-white/45 p-4 dark:bg-secondary/45 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                          Acoes de backup
                        </p>
                        <p className="mt-2 text-[13px] text-muted-foreground">
                          Consulte os arquivos automaticos ou gere um pacote completo sob demanda.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="fac-button-secondary text-[11px]"
                          onClick={handleOpenAutoBackups}
                          disabled={autoBackupOpening}
                        >
                          {autoBackupOpening ? 'Abrindo...' : 'Ver backups automaticos'}
                        </button>

                        <button
                          type="button"
                          className="fac-button-primary text-[11px]"
                          onClick={handleExportAll}
                          disabled={exportingAll}
                        >
                          {exportingAll ? 'Gerando...' : 'Backup total agora'}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {selectedGroup.key === 'shortcuts' ? (
                    <div className="mt-4 flex flex-col gap-3 rounded-[18px] border border-border bg-white/45 p-4 dark:bg-secondary/45 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                          Acoes de atalhos
                        </p>
                        <p className="mt-2 text-[13px] text-muted-foreground">
                          Cadastre combinacoes globais para navegar rapido por paginas internas
                          ou abrir destinos externos.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="fac-button-primary text-[11px]"
                          onClick={openCreateShortcut}
                        >
                          Novo atalho
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    {selectedGroup.kind === 'shortcuts'
                      ? shortcutItems.map((shortcut) => renderShortcutCard(shortcut))
                      : selectedGroup.items.map((config) => renderConfigCard(config))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {renderAutoBackupModal()}
      {renderShortcutModal()}
      <ConfirmModal
        open={Boolean(shortcutDeleteTarget)}
        title="Remover atalho"
        description={
          shortcutDeleteTarget
            ? `O atalho "${shortcutDeleteTarget.title}" sera removido do catalogo global.`
            : 'O atalho selecionado sera removido do catalogo global.'
        }
        confirmLabel="Remover atalho"
        loading={shortcutRemoving}
        onConfirm={handleRemoveShortcut}
        onClose={() => setShortcutDeleteTarget(null)}
      />
    </div>
  );
}
