import { useQuery } from '@tanstack/react-query';
import { Book, FilterBooksDto, BooksResponse } from '../types/books';

export const useBooks = (filters: FilterBooksDto) => {
  return useQuery<BooksResponse>({
    queryKey: ['books', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`/api/books?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      return response.json();
    },
  });
};
