import { useState, useEffect, useCallback } from 'react';
import { Book, BookFilters, BookSort, BooksResponse, PaginationInfo } from '@/types/books';

interface UseBooksOptions {
  initialPage?: number;
  initialPerPage?: number;
  initialSorts?: BookSort[];
}

interface UseBooksReturn {
  // Data
  books: Book[];
  total: number;
  loading: boolean;
  error: string | null;

  // Pagination
  pagination: PaginationInfo;

  // Filters & Search
  filters: BookFilters;
  debouncedSearch: string;

  // Sorting
  sorts: BookSort[];

  // Actions
  setPage: (page: number) => void;
  setPerPage: (perPage: string) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Partial<BookFilters>) => void;
  addSort: (field: string) => void;
  removeSort: (field: string) => void;
  resetSorts: () => void;
  refetch: () => Promise<void>;
  exportCsv: () => Promise<void>;
}

/**
 * Custom hook for managing books data, filters, pagination and sorting
 */
export function useBooks(options: UseBooksOptions = {}): UseBooksReturn {
  const {
    initialPage = 1,
    initialPerPage = 10,
    initialSorts = [{ field: 'createdAt', dir: 'desc' }],
  } = options;

  // State
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage.toString());

  // Filters
  const [filters, setFiltersState] = useState<BookFilters>({
    q: '',
    genre: '',
    publisher: '',
    author: '',
    available: '',
  });

  // Sorting
  const [sorts, setSorts] = useState<BookSort[]>(initialSorts);

  // Computed values
  const totalPages = Math.max(1, Math.ceil(total / Number(perPage)));
  const pagination: PaginationInfo = {
    page,
    perPage: Number(perPage),
    total,
    totalPages,
  };

  // Fetch books function
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(perPage));

      // Add filters
      if (filters.q) params.set('q', filters.q);
      if (filters.genre && filters.genre !== 'all') params.set('genre', filters.genre);
      if (filters.publisher && filters.publisher !== 'all') params.set('publisher', filters.publisher);
      if (filters.author && filters.author !== 'all') params.set('author', filters.author);
      if (filters.available && filters.available !== 'any') params.set('available', filters.available);

      // Add sorting
      if (sorts.length) {
        params.set('sort', sorts.map((s) => `${s.field}:${s.dir}`).join(','));
      }

      const response = await fetch(`/api/books?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.statusText}`);
      }

      const data: BooksResponse = await response.json();
      setBooks(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching books';
      setError(errorMessage);
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, filters, sorts]);

  // Export CSV function
  const exportCsv = useCallback(async () => {
    try {
      const response = await fetch('/api/books?limit=1000'); // Get more data for export
      if (!response.ok) throw new Error('Failed to export');

      const data = await response.json();
      const headers = ['id', 'title', 'author', 'publisher', 'genre', 'available', 'createdAt'];

      const rows = (data.items || []).map((book: Record<string, unknown>) =>
        headers.map((header) => {
          const value = book[header];
          return JSON.stringify(value ?? '');
        }).join(',')
      );

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `books-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      throw err;
    }
  }, []);

  // Filter actions
  const setSearch = useCallback((search: string) => {
    setFiltersState(prev => ({ ...prev, q: search }));
    setPage(1); // Reset to first page when searching
  }, []);

  const setFilters = useCallback((newFilters: Partial<BookFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filtering
  }, []);

  // Sort actions
  const addSort = useCallback((field: string) => {
    setSorts(prev => {
      const existingIndex = prev.findIndex(s => s.field === field);
      if (existingIndex >= 0) {
        // Toggle direction if field already exists
        const newSorts = [...prev];
        newSorts[existingIndex] = {
          field,
          dir: newSorts[existingIndex].dir === 'asc' ? 'desc' : 'asc',
        };
        return newSorts;
      } else {
        // Add new sort
        return [...prev, { field, dir: 'asc' }];
      }
    });
  }, []);

  const removeSort = useCallback((field: string) => {
    setSorts(prev => prev.filter(s => s.field !== field));
  }, []);

  const resetSorts = useCallback(() => {
    setSorts(initialSorts);
  }, [initialSorts]);

  // Pagination actions
  const handleSetPage = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  }, [totalPages]);

  const handleSetPerPage = useCallback((newPerPage: string) => {
    setPerPage(newPerPage);
    setPage(1); // Reset to first page when changing page size
  }, []);

  // Effect to fetch books when dependencies change
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return {
    // Data
    books,
    total,
    loading,
    error,

    // Pagination
    pagination,

    // Filters & Search
    filters,
    debouncedSearch: filters.q,

    // Sorting
    sorts,

    // Actions
    setPage: handleSetPage,
    setPerPage: handleSetPerPage,
    setSearch,
    setFilters,
    addSort,
    removeSort,
    resetSorts,
    refetch: fetchBooks,
    exportCsv,
  };
}
