import { Book, BooksTableColumn } from '@/types/books';
import DataTable from '@/components/ui/data-table';

interface BooksTableProps {
  books: Book[];
  loading?: boolean;
  columns?: BooksTableColumn[];
  emptyMessage?: string;
}

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
    header: 'Created',
    render: (book: Book) =>
      book.createdAt ? new Date(book.createdAt).toLocaleDateString() : '',
    sortable: true,
  },
];

export function BooksTable({
  books,
  loading = false,
  columns = defaultColumns,
  emptyMessage = 'No books found',
}: BooksTableProps) {
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
      columns={columns}
      data={books}
    />
  );
}
