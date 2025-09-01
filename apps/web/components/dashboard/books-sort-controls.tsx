import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BookSort } from '@/types/books';

interface BooksSortControlsProps {
  sorts: BookSort[];
  perPage: string;
  onPerPageChange: (perPage: string) => void;
  onAddSort: (field: string) => void;
  onResetSorts: () => void;
  onExportCsv: () => Promise<void>;
  sortableFields?: Array<{ value: string; label: string }>;
  perPageOptions?: string[];
}

const defaultSortableFields = [
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author' },
  { value: 'publisher', label: 'Publisher' },
  { value: 'genre', label: 'Genre' },
  { value: 'available', label: 'Availability' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
];

const defaultPerPageOptions = ['5', '10', '20', '50'];

export function BooksSortControls({
  sorts,
  perPage,
  onPerPageChange,
  onAddSort,
  onResetSorts,
  onExportCsv,
  sortableFields = defaultSortableFields,
  perPageOptions = defaultPerPageOptions,
}: BooksSortControlsProps) {
  const handleExportCsv = async () => {
    try {
      await onExportCsv();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      // Here you could show a toast notification
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* First row: Per page and quick sort buttons */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Label>Per page:</Label>
          <Select value={perPage} onValueChange={onPerPageChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {perPageOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onResetSorts} variant="outline" size="sm">
            Reset Sort
          </Button>

          <Button onClick={handleExportCsv} className="bg-slate-800 hover:bg-slate-900">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Second row: Sort field buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Label className="text-sm text-gray-600">Quick sort by:</Label>
        {sortableFields.map((field) => {
          const currentSort = sorts.find(s => s.field === field.value);
          const isActive = !!currentSort;
          const direction = currentSort?.dir || 'asc';
          
          return (
            <Button
              key={field.value}
              onClick={() => onAddSort(field.value)}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`relative ${isActive ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              {field.label}
              {isActive && (
                <span className="ml-1 text-xs">
                  {direction === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
