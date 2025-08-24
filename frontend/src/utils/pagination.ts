import { PaginationResult } from '../types';

export function paginate<T>(
  items: T[], 
  page: number, 
  perPage: number
): PaginationResult<T> {
  const totalItems = items.length;
  const pageCount = Math.ceil(totalItems / perPage) || 1;
  const startIndex = (page - 1) * perPage;
  const paginatedItems = items.slice(startIndex, startIndex + perPage);
  
  return {
    items: paginatedItems,
    pageCount,
    currentPage: page,
    totalItems
  };
}

export function createCategoryMap<T extends { id: number }>(categories: T[]) {
  const map: Record<number, T> = {};
  for (const category of categories) {
    map[category.id] = category;
  }
  return map;
}