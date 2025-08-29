import React, { useState, useEffect, useCallback } from 'react';
import { useBooks } from '../hooks/useBooks';
import { Book, FilterBooksDto } from '../types/books';

const BooksList: React.FC = () => {
  const [filters, setFilters] = useState<FilterBooksDto>({
    page: 1,
    per_page: 10,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Fetch books with filters
  const { data, isLoading, error } = useBooks(filters);

  // Handle search with debounce
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: value || undefined,
        page: 1, // Reset to first page on search
      }));
    }, 500); // 500ms debounce

    setDebounceTimer(timer);
  }, [debounceTimer]);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterBooksDto, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page on filter change
    }));
  };

  // Handle sort change
  const handleSortChange = (sort: string) => {
    setFilters(prev => ({
      ...prev,
      sort: sort || undefined,
      page: 1,
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">Error loading books</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Books Library</h1>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.genre || ''}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Genres</option>
            <option value="Fiction">Fiction</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Mystery">Mystery</option>
            <option value="Romance">Romance</option>
            <option value="Science Fiction">Science Fiction</option>
          </select>

          <input
            type="text"
            placeholder="Filter by publisher"
            value={filters.publisher || ''}
            onChange={(e) => handleFilterChange('publisher', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="text"
            placeholder="Filter by author"
            value={filters.author || ''}
            onChange={(e) => handleFilterChange('author', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <select
            value={filters.available === undefined ? '' : String(filters.available)}
            onChange={(e) => handleFilterChange('available', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Availability</option>
            <option value="true">Available</option>
            <option value="false">Not Available</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <select
            value={filters.sort || ''}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Default Sort</option>
            <option value="title:asc">Title A-Z</option>
            <option value="title:desc">Title Z-A</option>
            <option value="author:asc">Author A-Z</option>
            <option value="author:desc">Author Z-A</option>
            <option value="created_at:desc">Newest First</option>
            <option value="created_at:asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      {data && (
        <div className="mb-4 text-gray-600">
          Showing {data.data.length} of {data.total} books
          (Page {data.page} of {data.total_pages})
        </div>
      )}

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data.map((book: Book) => (
          <div key={book.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{book.title}</h3>
            <p className="text-gray-600 mb-1">Author: {book.author}</p>
            <p className="text-gray-600 mb-1">Publisher: {book.publisher}</p>
            <p className="text-gray-600 mb-1">Genre: {book.genre}</p>
            <p className={`text-sm ${book.available ? 'text-green-600' : 'text-red-600'}`}>
              {book.available ? 'Available' : 'Not Available'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Added: {new Date(book.createdAt || '').toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => handlePageChange(data.page - 1)}
            disabled={data.page <= 1}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, data.total_pages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(data.total_pages - 4, data.page - 2)) + i;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  pageNum === data.page
                    ? 'text-blue-600 bg-blue-50 border border-blue-300'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(data.page + 1)}
            disabled={data.page >= data.total_pages}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* No Results */}
      {data && data.data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default BooksList;
