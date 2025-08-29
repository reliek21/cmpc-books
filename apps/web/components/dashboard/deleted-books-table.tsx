'use client';

import { useState, useEffect } from 'react';
import { Book } from '@/types/books';
import { BooksTable } from './books-table';
import { Button } from '@/components/ui/button';
import { useBooks } from '@/hooks/useBooks';

export function DeletedBooksTable() {
  const [deletedBooks, setDeletedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { restoreBook, forceDeleteBook } = useBooks();

  const fetchDeletedBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/books/deleted');
      if (response.ok) {
        const books = await response.json();
        setDeletedBooks(books);
      }
    } catch (error) {
      console.error('Error fetching deleted books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedBooks();
  }, []);

  const handleRestore = async (id: number) => {
    try {
      await restoreBook(id);
      await fetchDeletedBooks(); // Refresh the list
    } catch (error) {
      console.error('Error restoring book:', error);
    }
  };

  const handleForceDelete = async (id: number) => {
    try {
      await forceDeleteBook(id);
      await fetchDeletedBooks(); // Refresh the list
    } catch (error) {
      console.error('Error permanently deleting book:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Deleted Books</h2>
        <Button onClick={fetchDeletedBooks} variant="outline">
          Refresh
        </Button>
      </div>
      
      <BooksTable
        books={deletedBooks}
        loading={loading}
        emptyMessage="No deleted books found"
        onRestoreBook={handleRestore}
        onForceDeleteBook={handleForceDelete}
        showDeleted={true}
      />
    </div>
  );
}
