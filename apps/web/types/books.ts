// Types for the Books Dashboard
export interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  genre: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookFilters {
  q: string;
  genre: string;
  publisher: string;
  author: string;
  available: string;
}

export interface BookSort {
  field: string;
  dir: 'asc' | 'desc';
}

export interface BooksResponse {
  items: Book[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface BooksTableColumn {
  key: keyof Book;
  header: string;
  render?: (row: Book) => React.ReactNode;
  sortable?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface GenreOption extends FilterOption {}
export interface PublisherOption extends FilterOption {}
export interface AuthorOption extends FilterOption {}
export interface AvailabilityOption extends FilterOption {}
