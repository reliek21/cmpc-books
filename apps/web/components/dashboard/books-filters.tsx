import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { BookFilters, FilterOption } from '@/types/books';

interface BooksFiltersProps {
  filters: BookFilters;
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: Partial<BookFilters>) => void;
  genreOptions?: FilterOption[];
  publisherOptions?: FilterOption[];
  authorOptions?: FilterOption[];
  availabilityOptions?: FilterOption[];
  showAvailability?: boolean;
}

const defaultGenreOptions: FilterOption[] = [
  { label: 'All genres', value: 'all' },
  { label: 'Fiction', value: 'Fiction' },
  { label: 'Sci-Fi', value: 'Sci-Fi' },
  { label: 'Fantasy', value: 'Fantasy' },
  { label: 'Non-Fiction', value: 'Non-Fiction' },
  { label: 'Mystery', value: 'Mystery' },
];

const defaultPublisherOptions: FilterOption[] = [
  { label: 'All publishers', value: 'all' },
  { label: 'ACME', value: 'ACME' },
  { label: 'Orbit', value: 'Orbit' },
  { label: 'Penguin', value: 'Penguin' },
  { label: 'Harper', value: 'Harper' },
];

const defaultAuthorOptions: FilterOption[] = [
  { label: 'All authors', value: 'all' },
  { label: 'Alice', value: 'Alice' },
  { label: 'Bob', value: 'Bob' },
  { label: 'Carol', value: 'Carol' },
  { label: 'David', value: 'David' },
];

const defaultAvailabilityOptions: FilterOption[] = [
  { label: 'Any', value: 'any' },
  { label: 'Available', value: 'true' },
  { label: 'Not available', value: 'false' },
];

export function BooksFilters({
  filters,
  onSearchChange,
  onFiltersChange,
  genreOptions = defaultGenreOptions,
  publisherOptions = defaultPublisherOptions,
  authorOptions = defaultAuthorOptions,
  availabilityOptions = defaultAvailabilityOptions,
  showAvailability = false,
}: BooksFiltersProps) {
  const handleSearchChange = (value: string) => {
    onSearchChange(value);
  };

  const handleFilterChange = (key: keyof BookFilters, value: string) => {
    onFiltersChange({ [key]: value });
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Search bar - full width */}
      <div className="w-full">
        <Input
          placeholder="Search books by title, author, publisher, or genre..."
          value={filters.q}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Filter selects */}
      <div className={`grid gap-3 ${showAvailability ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        <Select
          value={filters.genre}
          onValueChange={(value) => handleFilterChange('genre', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All genres" />
          </SelectTrigger>
          <SelectContent>
            {genreOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.publisher}
          onValueChange={(value) => handleFilterChange('publisher', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All publishers" />
          </SelectTrigger>
          <SelectContent>
            {publisherOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.author}
          onValueChange={(value) => handleFilterChange('author', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All authors" />
          </SelectTrigger>
          <SelectContent>
            {authorOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showAvailability && (
          <Select
            value={filters.available}
            onValueChange={(value) => handleFilterChange('available', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any availability" />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
