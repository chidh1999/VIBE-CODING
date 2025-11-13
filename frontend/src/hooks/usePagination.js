import { useState, useEffect, useMemo } from 'react';

export const usePagination = (items = [], itemsPerPage = 10, searchTerm = '') => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when items or search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length, searchTerm]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    totalItems: items.length,
    goToPage,
    goToNextPage,
    goToPrevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

