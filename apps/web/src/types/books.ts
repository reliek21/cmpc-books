export interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  genre: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
}

export interface FilterBooksDto {
  search?: string;
  genre?: string;
  publisher?: string;
  author?: string;
  available?: boolean;
  sort?: string;
  page?: number;
  per_page?: number;
}

export interface BooksResponse {
  data: Book[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface FilterOption {
  value: string;
  label: string;
}
