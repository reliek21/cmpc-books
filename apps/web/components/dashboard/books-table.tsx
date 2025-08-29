import { Book, BooksTableColumn } from '@/types/books';
import DataTable from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface BooksTableProps {
  books: Book[];
  loading?: boolean;
  columns?: BooksTableColumn[];
  emptyMessage?: string;
  onDeleteBook?: (id: number) => Promise<void>;
  onRestoreBook?: (id: number) => Promise<void>;
  onForceDeleteBook?: (id: number) => Promise<void>;
  onEditBook?: (book: Book) => void;
  showDeleted?: boolean;
}

export function BooksTable({
  books,
  loading = false,
  columns,
  emptyMessage = 'No books found',
  onDeleteBook,
  onRestoreBook,
  onForceDeleteBook,
  onEditBook,
  showDeleted = false,
}: BooksTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!onDeleteBook) return;
    setDeletingId(id);
    try {
      await onDeleteBook(id);
    } catch (error) {
      console.error('Error deleting book:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (id: number) => {
    if (!onRestoreBook) return;
    setRestoringId(id);
    try {
      await onRestoreBook(id);
    } catch (error) {
      console.error('Error restoring book:', error);
    } finally {
      setRestoringId(null);
    }
  };

  const handleForceDelete = async (id: number) => {
    if (!onForceDeleteBook) return;
    if (!window.confirm('Are you sure you want to permanently delete this book? This action cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      await onForceDeleteBook(id);
    } catch (error) {
      console.error('Error permanently deleting book:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const defaultColumns: BooksTableColumn[] = [
    { key: 'title', header: 'Title', sortable: true },
    { key: 'author', header: 'Author', sortable: true },
    { key: 'publisher', header: 'Publisher', sortable: true },
    { key: 'genre', header: 'Genre', sortable: true },
    {
      key: 'available',
      header: 'Available',
      render: (book: Book) => (
        <span className={book.available ? 'text-green-600' : 'text-red-600'}>
          {book.available ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: showDeleted ? 'Deleted At' : 'Created',
      render: (book: Book) => {
        const date = showDeleted ? book.deletedAt : book.createdAt;
        return date ? new Date(date).toLocaleDateString() : '';
      },
      sortable: true,
    },
    {
      key: 'id',
      header: 'Actions',
      render: (book: Book) => (
        <div className="flex gap-2">
          {showDeleted ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRestore(book.id)}
                disabled={restoringId === book.id}
                className="text-green-600 hover:text-green-700"
              >
                {restoringId === book.id ? 'Restoring...' : 'Restore'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleForceDelete(book.id)}
                disabled={deletingId === book.id}
                className="text-red-600 hover:text-red-700"
              >
                {deletingId === book.id ? 'Deleting...' : 'Delete Forever'}
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              {onEditBook && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditBook(book)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Edit
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(book.id)}
                disabled={deletingId === book.id}
                className="text-red-600 hover:text-red-700"
              >
                {deletingId === book.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const finalColumns = columns || defaultColumns;

  if (loading) {
    return (
      <div className="border rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <DataTable
      data={books}
      columns={finalColumns}
    />
  );
}
