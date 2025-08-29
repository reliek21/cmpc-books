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
  { value: 'createdAt', label: 'Created Date' },
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
    <div className="flex items-center justify-between gap-3 mb-4">
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

        {sortableFields.map((field) => (
          <Button
            key={field.value}
            onClick={() => onAddSort(field.value)}
            variant="outline"
            size="sm"
          >
            Sort {field.label}
          </Button>
        ))}

        <Button onClick={handleExportCsv} className="bg-slate-800 hover:bg-slate-900">
          Export CSV
        </Button>
      </div>
    </div>
  );
}
