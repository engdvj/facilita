export const backupOptions = [
  { key: 'users', label: 'Usuarios', hint: 'Perfis e credenciais.' },
  { key: 'rolePermissions', label: 'Permissoes', hint: 'Regras por role.' },
  { key: 'categories', label: 'Categorias', hint: 'Categorias dos usuarios.' },
  { key: 'links', label: 'Links', hint: 'Links criados pelos usuarios.' },
  {
    key: 'uploadedSchedules',
    label: 'Documentos',
    hint: 'Documentos enviados.',
  },
  {
    key: 'notes',
    label: 'Notas',
    hint: 'Notas dos usuarios.',
  },
  {
    key: 'uploadedImages',
    label: 'Imagens',
    hint: 'Arquivos de imagem enviados.',
  },
  {
    key: 'shares',
    label: 'Compartilhamentos',
    hint: 'Relacoes de compartilhamento entre usuarios.',
  },
  {
    key: 'favorites',
    label: 'Favoritos',
    hint: 'Itens favoritos dos usuarios.',
  },
  {
    key: 'notifications',
    label: 'Notificacoes',
    hint: 'Notificacoes in-app.',
  },
  {
    key: 'systemConfig',
    label: 'Configuracoes',
    hint: 'Configuracoes globais da plataforma.',
  },
] as const;

export type BackupOptionKey = (typeof backupOptions)[number]['key'];
export type BackupEntity = BackupOptionKey;
export type BackupSelection = Record<BackupOptionKey, boolean>;

export const buildInitialSelection = (value = true): BackupSelection =>
  backupOptions.reduce((acc, option) => {
    acc[option.key] = value;
    return acc;
  }, {} as BackupSelection);

export const getSelectedEntities = (
  selection: BackupSelection,
): BackupEntity[] => {
  const base = backupOptions
    .filter((option) => selection[option.key])
    .map((option) => option.key);

  return Array.from(new Set(base));
};

export const countSelectedOptions = (selection: BackupSelection) =>
  backupOptions.reduce(
    (total, option) => total + (selection[option.key] ? 1 : 0),
    0,
  );

export const areAllOptionsSelected = (selection: BackupSelection) =>
  backupOptions.every((option) => selection[option.key]);
