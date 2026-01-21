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
