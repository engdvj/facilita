export const backupOptions = [
  { key: 'companies', label: 'Empresas', hint: 'Cadastro de empresas.' },
  { key: 'units', label: 'Unidades', hint: 'Unidades vinculadas as empresas.' },
  { key: 'sectors', label: 'Setores', hint: 'Departamentos e areas.' },
  { key: 'users', label: 'Usuarios', hint: 'Perfis e credenciais.' },
  { key: 'rolePermissions', label: 'Permissoes', hint: 'Regras por role.' },
  { key: 'categories', label: 'Categorias', hint: 'Categorias de links.' },
  { key: 'links', label: 'Links', hint: 'Links e conteudo.' },
  {
    key: 'uploadedSchedules',
    label: 'Documentos',
    hint: 'Documentos enviados.',
  },
  {
    key: 'notes',
    label: 'Notas',
    hint: 'Notas pessoais e compartilhadas.',
  },
] as const;

export type BackupOption = (typeof backupOptions)[number];
export type BackupOptionKey = (typeof backupOptions)[number]['key'];
export type BackupEntity = BackupOptionKey;
export type BackupSelection = Record<BackupOptionKey, boolean>;

const userModeHiddenKeys: BackupOptionKey[] = [
  'companies',
  'units',
  'sectors',
];

export const getBackupOptions = (
  mode: 'company' | 'user',
): BackupOption[] =>
  mode === 'user'
    ? backupOptions.filter(
        (option) => !userModeHiddenKeys.includes(option.key),
      )
    : [...backupOptions];

export const buildInitialSelection = (
  options: readonly BackupOption[] = backupOptions,
  value = true,
): BackupSelection => {
  const optionKeys = new Set(options.map((option) => option.key));
  return backupOptions.reduce((acc, option) => {
    acc[option.key] = optionKeys.has(option.key) ? value : false;
    return acc;
  }, {} as BackupSelection);
};

export const getSelectedEntities = (
  selection: BackupSelection,
  options: readonly BackupOption[] = backupOptions,
): BackupEntity[] => {
  const base = options
    .filter((option) => selection[option.key])
    .map((option) => option.key);

  return Array.from(new Set(base));
};

export const countSelectedOptions = (
  selection: BackupSelection,
  options: readonly BackupOption[] = backupOptions,
) =>
  options.reduce(
    (total, option) => total + (selection[option.key] ? 1 : 0),
    0,
  );

export const areAllOptionsSelected = (
  selection: BackupSelection,
  options: readonly BackupOption[] = backupOptions,
) => options.every((option) => selection[option.key]);
