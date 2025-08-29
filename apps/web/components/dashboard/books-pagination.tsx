import { Button } from '@/components/ui/button';
import { PaginationInfo } from '@/types/books';

interface BooksPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
}

export function BooksPagination({
  pagination,
  onPageChange,
  showInfo = true,
}: BooksPaginationProps) {
  const { page, totalPages, total } = pagination;

  const handlePrevPage = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  const handlePageClick = (pageNum: number) => {
    onPageChange(pageNum);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const start = Math.max(1, page - 2);
      const end = Math.min(totalPages, page + 2);

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push(-1); // Ellipsis
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push(-1); // Ellipsis
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return showInfo ? (
      <div className="flex justify-between items-center gap-4 mt-4">
        <div>Showing {total} total items</div>
      </div>
    ) : null;
  }

  return (
    <div className="flex items-center justify-between gap-4 mt-4">
      {showInfo && (
        <div className="text-sm text-gray-600">
          Showing {total} total items
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          onClick={handlePrevPage}
          disabled={page <= 1}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) => (
            pageNum === -1 ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                className="min-w-[40px]"
              >
                {pageNum}
              </Button>
            )
          ))}
        </div>

        <Button
          onClick={handleNextPage}
          disabled={page >= totalPages}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
