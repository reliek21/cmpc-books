"use client"

import React from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { BooksHeader } from '@/components/dashboard/books-header'
import { BooksFilters } from '@/components/dashboard/books-filters'
import { BooksSortControls } from '@/components/dashboard/books-sort-controls'
import { BooksTable } from '@/components/dashboard/books-table'
import { BooksPagination } from '@/components/dashboard/books-pagination'
import { BooksActiveSorts } from '@/components/dashboard/books-active-sorts'
import { useBooks } from '@/hooks/useBooks'
import { useDebounce } from '@/hooks/useDebounce'

export default function DashboardPage() {
  const {
    books,
    total,
    loading,
    error,
    pagination,
    filters,
    sorts,
    setPage,
    setPerPage,
    setSearch,
    setFilters,
    addSort,
    removeSort,
    resetSorts,
    exportCsv,
  } = useBooks();

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

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-7xl mx-auto">
        <BooksHeader />

        <BooksFilters
          filters={filters}
          onSearchChange={handleSearchChange}
          onFiltersChange={setFilters}
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
