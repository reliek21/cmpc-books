'use client';

import React, { useState } from 'react';
import { useBooks } from '../../hooks/useBooks';
import { Book } from '../types/books';
import Link from 'next/link';
import { ImageUpload } from '../../components/ui/image-upload';

const BooksList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [showImageUpload, setShowImageUpload] = useState<number | null>(null);

  // Use the books hook
  const {
    books,
    total,
    loading,
    error,
    pagination,
    filters,
    setPage,
    setPerPage,
    setSearch,
    setFilters,
    deleteBook,
    uploadBookImage,
  } = useBooks();

  // Handle delete with confirmation
  const handleDelete = async (book: Book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      return;
    }

    setDeletingId(book.id);
    try {
      await deleteBook(book.id);
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSearch(value);
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value || undefined });
  };

  // Handle image upload
  const handleImageUpload = async (bookId: number, file: File) => {
    setUploadingId(bookId);
    try {
      await uploadBookImage(bookId, file);
      setShowImageUpload(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">Error loading books: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Books Library</h1>
        <Link
          href="/books/deleted"
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          View Deleted Books
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
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
            value={filters.available || ''}
            onChange={(e) => handleFilterChange('available', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Availability</option>
            <option value="true">Available</option>
            <option value="false">Not Available</option>
          </select>
        </div>

        {/* Page Size */}
        <div className="flex items-center gap-4">
          <label htmlFor="pageSize" className="text-sm font-medium">
            Books per page:
          </label>
          <select
            id="pageSize"
            value={pagination.perPage}
            onChange={(e) => setPerPage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-4 text-gray-600">
        Showing {books.length} of {total} books
        (Page {pagination.page} of {pagination.totalPages})
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book: Book) => (
          <div key={book.id} className="bg-white rounded-lg shadow-md p-6">
            {/* Book Image */}
            <div className="mb-4 flex justify-center">
              {book.imageUrl ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${book.imageUrl}`}
                  alt={`${book.title} cover`}
                  className="w-24 h-32 object-cover rounded-lg shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-24 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            <h3 className="text-xl font-semibold mb-2">{book.title}</h3>
            <p className="text-gray-600 mb-1">Author: {book.author}</p>
            <p className="text-gray-600 mb-1">Publisher: {book.publisher}</p>
            <p className="text-gray-600 mb-1">Genre: {book.genre}</p>
            <p className={`text-sm ${book.available ? 'text-green-600' : 'text-red-600'}`}>
              {book.available ? 'Available' : 'Not Available'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Added: {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'N/A'}
            </p>
            
            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowImageUpload(showImageUpload === book.id ? null : book.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex-1"
                >
                  {book.imageUrl ? 'Change Image' : 'Add Image'}
                </button>
                <button
                  onClick={() => handleDelete(book)}
                  disabled={deletingId === book.id}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deletingId === book.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>

              {/* Image Upload Component */}
              {showImageUpload === book.id && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <ImageUpload
                    onImageUpload={(file) => handleImageUpload(book.id, file)}
                    currentImageUrl={book.imageUrl ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${book.imageUrl}` : undefined}
                    isUploading={uploadingId === book.id}
                    bookId={book.id}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => setPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  pageNum === pagination.page
                    ? 'text-blue-600 bg-blue-50 border border-blue-300'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* No Results */}
      {books.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default BooksList;
