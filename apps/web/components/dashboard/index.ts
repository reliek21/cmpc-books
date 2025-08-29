// Dashboard Components Index
// Central export point for all dashboard components

export { BooksHeader } from './books-header';
export { BooksFilters } from './books-filters';
export { BooksSortControls } from './books-sort-controls';
export { BooksTable } from './books-table';
export { BooksPagination } from './books-pagination';
export { BooksActiveSorts } from './books-active-sorts';
export { AddBookForm } from './add-book-form';

// Re-export types for convenience
export type {
  Book,
  BookFilters,
  BookSort,
  BooksResponse,
  PaginationInfo,
  BooksTableColumn,
  FilterOption,
} from '@/types/books';
