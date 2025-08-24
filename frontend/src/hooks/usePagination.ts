import { useState, useMemo } from 'react';
import { paginate } from '../utils/pagination';
import { PaginationResult } from '../types';

interface UsePaginationProps {
  itemsPerPage?: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  paginateItems: (items: T[]) => PaginationResult<T>;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: (totalPages: number) => void;
}

export function usePagination<T>({
  itemsPerPage = 5,
  initialPage = 1
}: UsePaginationProps = {}): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const paginateItems = useMemo(() => {
    return (items: T[]): PaginationResult<T> => {
      const result = paginate(items, currentPage, itemsPerPage);
      
      if (result.pageCount > 0 && currentPage > result.pageCount) {
        setCurrentPage(1);
        return paginate(items, 1, itemsPerPage);
      }
      
      return result;
    };
  }, [currentPage, itemsPerPage]);

  const goToNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = (totalPages: number) => {
    setCurrentPage(totalPages);
  };

  return {
    currentPage,
    setCurrentPage,
    paginateItems,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
  };
}