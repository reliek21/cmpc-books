import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

interface BooksHeaderProps {
  onAddBook?: () => void;
  showAddButton?: boolean;
}

export function BooksHeader({ onAddBook, showAddButton = true }: BooksHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleAddBook = () => {
    if (onAddBook) {
      onAddBook();
    } else {
      router.push('/dashboard/new');
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-semibold">Books Dashboard</h2>
        {user && (
          <p className="text-sm text-gray-600 mt-1">
            Welcome, {user.first_name} {user.last_name} ({user.email})
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showAddButton && (
          <Button onClick={handleAddBook} className="bg-blue-600 hover:bg-blue-700">
            Add Book
          </Button>
        )}

        <Button
          onClick={handleLogout}
          variant="outline"
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
