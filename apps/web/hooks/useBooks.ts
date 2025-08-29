import { useState, useEffect, useCallback } from 'react';
import { Book, BookFilters, BookSort, BooksResponse, PaginationInfo } from '@/types/books';

interface UseBooksOptions {
  initialPage?: number;
  initialPerPage?: number;
  initialSorts?: BookSort[];
}

interface UseBooksReturn {
  books: Book[];
  total: number;
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  filters: BookFilters;
  filterOptions: {
    genres: string[];
    authors: string[];
    publishers: string[];
  };
  debouncedSearch: string;
  sorts: BookSort[];
  setPage: (page: number) => void;
  setPerPage: (perPage: string) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Partial<BookFilters>) => void;
  addSort: (field: string) => void;
  removeSort: (field: string) => void;
  resetSorts: () => void;
  refetch: () => Promise<void>;
  exportCsv: () => Promise<void>;
  deleteBook: (id: number) => Promise<void>;
  restoreBook: (id: number) => Promise<void>;
  forceDeleteBook: (id: number) => Promise<void>;
  fetchDeletedBooks: () => Promise<Book[]>;
  uploadBookImage: (id: number, file: File) => Promise<void>;
}

export function useBooks(options: UseBooksOptions = {}): UseBooksReturn {
  const {
    initialPage = 1,
    initialPerPage = 10,
    initialSorts = [{ field: 'createdAt', dir: 'desc' }],
  } = options;

  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage.toString());

  const [filters, setFiltersState] = useState<BookFilters>({
    q: '',
    genre: '',
    publisher: '',
    author: '',
    available: '',
  });

  const [sorts, setSorts] = useState<BookSort[]>(initialSorts);

  const [filterOptions, setFilterOptions] = useState({
    genres: [] as string[],
    authors: [] as string[],
    publishers: [] as string[],
  });

  const totalPages = Math.max(1, Math.ceil(total / Number(perPage)));
  const pagination: PaginationInfo = {
    page,
    perPage: Number(perPage),
    total,
    totalPages,
  };

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', String(perPage));

      if (filters.q) params.set('search', filters.q);
      if (filters.genre && filters.genre !== 'all') params.set('genre', filters.genre);
      if (filters.publisher && filters.publisher !== 'all') params.set('publisher', filters.publisher);
      if (filters.author && filters.author !== 'all') params.set('author', filters.author);
      if (filters.available && filters.available !== 'any') params.set('available', filters.available);

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

  const exportCsv = useCallback(async () => {
    try {
      const response = await fetch('/api/books?limit=1000');
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

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/books?endpoint=filters');
      if (!response.ok) {
        throw new Error('Failed to fetch filter options');
      }
      const data = await response.json();
      setFilterOptions(data);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  }, []);

  const setSearch = useCallback((search: string) => {
    setFiltersState(prev => ({ ...prev, q: search }));
    setPage(1);
  }, []);

  const setFilters = useCallback((newFilters: Partial<BookFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  const addSort = useCallback((field: string) => {
    setSorts(prev => {
      const existingIndex = prev.findIndex(s => s.field === field);
      if (existingIndex >= 0) {
        const newSorts = [...prev];
        newSorts[existingIndex] = {
          field,
          dir: newSorts[existingIndex].dir === 'asc' ? 'desc' : 'asc',
        };
        return newSorts;
      } else {
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

  const deleteBook = useCallback(async (id: number) => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete book');
      }

      await fetchBooks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete book';
      setError(errorMessage);
      throw err;
    }
  }, [fetchBooks]);

  const restoreBook = useCallback(async (id: number) => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(`/api/books/${id}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to restore book');
      }

      await fetchBooks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore book';
      setError(errorMessage);
      throw err;
    }
  }, [fetchBooks]);

  const forceDeleteBook = useCallback(async (id: number) => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(`/api/books/${id}/force`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to permanently delete book');
      }

      await fetchBooks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to permanently delete book';
      setError(errorMessage);
      throw err;
    }
  }, [fetchBooks]);

  const fetchDeletedBooks = useCallback(async (): Promise<Book[]> => {
    try {
      const response = await fetch('/api/books/deleted');
      
      if (!response.ok) {
        throw new Error('Failed to fetch deleted books');
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch deleted books';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const uploadBookImage = useCallback(async (id: number, file: File): Promise<void> => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/books/${id}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      await fetchBooks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      throw err;
    }
  }, [fetchBooks]);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  }, [totalPages]);

  const handleSetPerPage = useCallback((newPerPage: string) => {
    setPerPage(newPerPage);
    setPage(1);
  }, []);

  useEffect(() => {
    fetchBooks();
    fetchFilterOptions();
  }, [fetchBooks, fetchFilterOptions]);

  return {
    books,
    total,
    loading,
    error,
    pagination,
    filters,
    filterOptions,
    debouncedSearch: filters.q,
    sorts,
    setPage: handleSetPage,
    setPerPage: handleSetPerPage,
    setSearch,
    setFilters,
    addSort,
    removeSort,
    resetSorts,
    refetch: fetchBooks,
    exportCsv,
    deleteBook,
    restoreBook,
    forceDeleteBook,
    fetchDeletedBooks,
    uploadBookImage,
  };
}
