import { Button } from '@/components/ui/button';
import { BookSort } from '@/types/books';

interface BooksActiveSortsProps {
  sorts: BookSort[];
  onRemoveSort: (field: string) => void;
}

const fieldLabels: Record<string, string> = {
  title: 'Title',
  author: 'Author',
  publisher: 'Publisher',
  genre: 'Genre',
  available: 'Availability',
  createdAt: 'Created Date',
  updatedAt: 'Updated Date',
};

export function BooksActiveSorts({ sorts, onRemoveSort }: BooksActiveSortsProps) {
  if (sorts.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Active Sorts ({sorts.length}):
      </div>
      <div className="flex flex-wrap gap-2">
        {sorts.map((sort, index) => (
          <div
            key={sort.field}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm"
          >
            <span className="text-xs text-blue-500">#{index + 1}</span>
            <span className="font-medium">
              {fieldLabels[sort.field] || sort.field}
            </span>
            <span className="text-xs font-mono">
              {sort.dir === 'asc' ? '↑ ASC' : '↓ DESC'}
            </span>
            <Button
              onClick={() => onRemoveSort(sort.field)}
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              title="Remove sort"
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
