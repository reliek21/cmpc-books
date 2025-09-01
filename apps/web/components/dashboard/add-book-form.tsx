"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ProtectedRoute } from '@/components/auth/protected-route';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  author: z.string().min(1, 'Author is required').max(100, 'Author must be less than 100 characters'),
  publisher: z.string().min(1, 'Publisher is required').max(100, 'Publisher must be less than 100 characters'),
  genre: z.string().min(1, 'Genre is required').max(50, 'Genre must be less than 50 characters'),
  available: z.boolean(),
});

type BookFormData = z.infer<typeof bookSchema>;

interface AddBookFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddBookForm({ onSuccess, onCancel }: AddBookFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      available: true,
    },
  });

  const available = watch('available');

  const onSubmit = async (data: BookFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Get authentication token
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Remove the available property before sending to backend
      const { available, ...bookData } = data;

      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create book');
      }

      // Success
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error creating book:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Add New Book</h2>
          <p className="text-gray-600 mt-1">Fill in the details to add a new book to the collection.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter book title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                {...register('author')}
                placeholder="Enter author name"
                className={errors.author ? 'border-red-500' : ''}
              />
              {errors.author && (
                <p className="text-red-500 text-sm">{errors.author.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="publisher">Publisher *</Label>
              <Input
                id="publisher"
                {...register('publisher')}
                placeholder="Enter publisher name"
                className={errors.publisher ? 'border-red-500' : ''}
              />
              {errors.publisher && (
                <p className="text-red-500 text-sm">{errors.publisher.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre *</Label>
              <Input
                id="genre"
                {...register('genre')}
                placeholder="Enter book genre"
                className={errors.genre ? 'border-red-500' : ''}
              />
              {errors.genre && (
                <p className="text-red-500 text-sm">{errors.genre.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="available"
              checked={available}
              onCheckedChange={(checked) => setValue('available', !!checked)}
            />
            <Label htmlFor="available" className="text-sm">
              Book is available for borrowing
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating Book...' : 'Create Book'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
