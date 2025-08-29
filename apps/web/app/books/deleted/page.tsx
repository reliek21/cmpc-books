'use client';

import { DeletedBooksTable } from '@/components/dashboard/deleted-books-table';

export default function DeletedBooksPage() {
  return (
    <div className="container mx-auto py-8">
      <DeletedBooksTable />
    </div>
  );
}
