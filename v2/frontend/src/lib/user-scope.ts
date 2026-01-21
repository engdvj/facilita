type UserSectorRef = {
  sectorId?: string | null;
  sector?: {
    sectorUnits?: {
      unitId?: string | null;
    }[] | null;
  } | null;
};

type UserScope = {
  sectorId?: string | null;
  unitId?: string | null;
  userSectors?: UserSectorRef[] | null;
};

export const getUserSectorIds = (user?: UserScope | null) => {
  const ids = new Set<string>();
  if (!user) return ids;
  if (user.sectorId) {
    ids.add(user.sectorId);
  }
  user.userSectors?.forEach((userSector) => {
    if (userSector?.sectorId) {
      ids.add(userSector.sectorId);
    }
  });
  return ids;
};

export const getUserUnitIds = (user?: UserScope | null) => {
  const ids = new Set<string>();
  if (!user) return ids;
  if (user.unitId) {
    ids.add(user.unitId);
  }
  user.userSectors?.forEach((userSector) => {
    userSector?.sector?.sectorUnits?.forEach((unit) => {
      if (unit?.unitId) {
        ids.add(unit.unitId);
      }
    });
  });
  return ids;
};
