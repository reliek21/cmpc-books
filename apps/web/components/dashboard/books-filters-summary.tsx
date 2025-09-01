import { BookFilters } from '@/types/books';
import { Button } from '@/components/ui/button';

interface BooksFiltersSummaryProps {
  filters: BookFilters;
  onClearFilters: () => void;
  totalResults: number;
}

export function BooksFiltersSummary({
  filters,
  onClearFilters,
  totalResults,
}: BooksFiltersSummaryProps) {
  const activeFilters = [];

  if (filters.q) {
    activeFilters.push(`Search: "${filters.q}"`);
  }
  if (filters.genre && filters.genre !== 'all') {
    activeFilters.push(`Genre: ${filters.genre}`);
  }
  if (filters.publisher && filters.publisher !== 'all') {
    activeFilters.push(`Publisher: ${filters.publisher}`);
  }
  if (filters.author && filters.author !== 'all') {
    activeFilters.push(`Author: ${filters.author}`);
  }
  if (filters.available && filters.available !== 'any') {
    const availabilityText = filters.available === 'true' ? 'Available' : 'Not Available';
    activeFilters.push(`Status: ${availabilityText}`);
  }

  if (activeFilters.length === 0) {
    return (
      <div className="text-sm text-gray-600 mb-2">
        Showing all {totalResults} books
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">
          {totalResults} books found with filters:
        </span>
        <div className="flex flex-wrap gap-1">
          {activeFilters.map((filter, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {filter}
            </span>
          ))}
        </div>
      </div>
      
      <Button
        onClick={onClearFilters}
        variant="outline"
        size="sm"
        className="text-gray-600 hover:text-gray-800"
      >
        Clear Filters
      </Button>
    </div>
  );
}
