type UserSectorRef = {
  sectorId?: string | null;
  userSectorUnits?: {
    unitId?: string | null;
  }[] | null;
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

export const getUserUnitsBySector = (user?: UserScope | null) => {
  const map = new Map<string, Set<string>>();
  if (!user) return map;

  if (user.sectorId) {
    const legacySet = map.get(user.sectorId) ?? new Set<string>();
    if (user.unitId) {
      legacySet.add(user.unitId);
    }
    map.set(user.sectorId, legacySet);
  }

  user.userSectors?.forEach((userSector) => {
    const sectorId = userSector?.sectorId;
    if (!sectorId) return;

    const explicitUnitIds =
      userSector?.userSectorUnits
        ?.map((unit) => unit?.unitId)
        .filter((unitId): unitId is string => Boolean(unitId)) || [];
    const fallbackUnitIds =
      userSector?.sector?.sectorUnits
        ?.map((unit) => unit?.unitId)
        .filter((unitId): unitId is string => Boolean(unitId)) || [];
    const resolvedUnitIds =
      explicitUnitIds.length > 0 ? explicitUnitIds : fallbackUnitIds;

    const target = map.get(sectorId) ?? new Set<string>();
    resolvedUnitIds.forEach((unitId) => target.add(unitId));
    map.set(sectorId, target);
  });

  return map;
};

export const getUserUnitIds = (user?: UserScope | null) => {
  const ids = new Set<string>();
  const map = getUserUnitsBySector(user);
  map.forEach((unitIds) => {
    unitIds.forEach((unitId) => ids.add(unitId));
  });
  return ids;
};
