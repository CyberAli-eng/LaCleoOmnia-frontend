import { useState, useMemo } from 'react';

export interface UsePaginationResult<T> {
  page: number;
  pageSize: number;
  totalPages: number;
  paginatedItems: T[];
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  nextPage: () => void;
  previousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export function usePagination<T>(
  items: T[],
  initialPageSize: number = 10
): UsePaginationResult<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(items.length / pageSize);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const handleSetPageSize = (size: number) => {
    setPageSize(size);
    setPage(1); // Reset to first page when changing page size
  };

  const goToFirstPage = () => setPage(1);
  const goToLastPage = () => setPage(totalPages);
  const nextPage = () => setPage((prev) => Math.min(prev + 1, totalPages));
  const previousPage = () => setPage((prev) => Math.max(prev - 1, 1));

  return {
    page,
    pageSize,
    totalPages,
    paginatedItems,
    setPage,
    setPageSize: handleSetPageSize,
    goToFirstPage,
    goToLastPage,
    nextPage,
    previousPage,
    canGoNext: page < totalPages,
    canGoPrevious: page > 1,
  };
}
