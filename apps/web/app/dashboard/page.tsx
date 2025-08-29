"use client"

import React, { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { BooksHeader } from '@/components/dashboard/books-header'
import { BooksFilters } from '@/components/dashboard/books-filters'
import { BooksSortControls } from '@/components/dashboard/books-sort-controls'
import { BooksTable } from '@/components/dashboard/books-table'
import { BooksPagination } from '@/components/dashboard/books-pagination'
import { BooksActiveSorts } from '@/components/dashboard/books-active-sorts'
import { EditBookForm } from '@/components/dashboard/edit-book-form'
import { useBooks } from '@/hooks/useBooks'
import { useDebounce } from '@/hooks/useDebounce'
import { Book } from '@/types/books'

export default function DashboardPage() {
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const {
    books,
    total,
    loading,
    error,
    pagination,
    filters,
    filterOptions,
    sorts,
    setPage,
    setPerPage,
    setSearch,
    setFilters,
    addSort,
    removeSort,
    resetSorts,
    exportCsv,
    deleteBook,
    restoreBook,
    forceDeleteBook,
    fetchDeletedBooks,
    uploadBookImage,
    updateBook,
  } = useBooks();

  // Convert dynamic filter options to FilterOption format
  const genreOptions = [
    { label: 'All genres', value: 'all' },
    ...(filterOptions?.genres || []).map(genre => ({ label: genre, value: genre }))
  ];

  const publisherOptions = [
    { label: 'All publishers', value: 'all' },
    ...(filterOptions?.publishers || []).map(publisher => ({ label: publisher, value: publisher }))
  ];

  const authorOptions = [
    { label: 'All authors', value: 'all' },
    ...(filterOptions?.authors || []).map(author => ({ label: author, value: author }))
  ];

  const availabilityOptions = [
    { label: 'Any', value: 'any' },
    { label: 'Available', value: 'true' },
    { label: 'Not available', value: 'false' },
  ];

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(filters.q, 350);

  // Update search when debounced value changes
  React.useEffect(() => {
    if (debouncedSearch !== filters.q) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, filters.q, setSearch]);

  const handleSearchChange = (search: string) => {
    // Update local filters immediately for UI responsiveness
    setFilters({ q: search });
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
  };

  const handleEditSuccess = () => {
    setEditingBook(null);
  };

  const handleEditCancel = () => {
    setEditingBook(null);
  };

  // If editing a book, show the edit form
  if (editingBook) {
    return (
      <EditBookForm
        book={editingBook}
        onSuccess={handleEditSuccess}
        onCancel={handleEditCancel}
      />
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-7xl mx-auto">
        <BooksHeader />

        <BooksFilters
          filters={filters}
          onSearchChange={handleSearchChange}
          onFiltersChange={setFilters}
          genreOptions={genreOptions}
          publisherOptions={publisherOptions}
          authorOptions={authorOptions}
          availabilityOptions={availabilityOptions}
          showAvailability={true}
        />

        <BooksSortControls
          sorts={sorts}
          perPage={pagination.perPage.toString()}
          onPerPageChange={setPerPage}
          onAddSort={addSort}
          onResetSorts={resetSorts}
          onExportCsv={exportCsv}
        />

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <BooksTable
          books={books}
          loading={loading}
          emptyMessage="No books found matching your criteria."
          onDeleteBook={deleteBook}
          onRestoreBook={restoreBook}
          onForceDeleteBook={forceDeleteBook}
          onEditBook={handleEditBook}
        />

        <BooksPagination
          pagination={pagination}
          onPageChange={setPage}
        />

        <BooksActiveSorts
          sorts={sorts}
          onRemoveSort={removeSort}
        />
      </div>
    </ProtectedRoute>
  )
}
