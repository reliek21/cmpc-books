"use client"

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProtectedRoute } from '@/components/auth/protected-route';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  publisher: z.string().min(1, 'Publisher is required'),
  genre: z.string().min(1, 'Genre is required'),
  available: z.boolean().optional(),
  image: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, 'Image is required')
    .refine(
      (files) => files[0]?.type.startsWith('image/'),
      'File must be an image'
    ),
});

export default function AddBookPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookSchema),
  });

  const onSubmit = (data: any) => {
    console.log(data);
    // Add logic to send data to the backend
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Add New Book</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-1">Title</Label>
            <Input
              type="text"
              {...register('title')}
              className="w-full border rounded px-3 py-2"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Author</Label>
            <Input
              type="text"
              {...register('author')}
              className="w-full border rounded px-3 py-2"
            />
            {errors.author && <p className="text-red-500 text-sm">{errors.author.message}</p>}
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Publisher</Label>
            <Input
              type="text"
              {...register('publisher')}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          {errors.publisher && <p className="text-red-500 text-sm">{errors.publisher.message}</p>}
          <div>
            <Label className="block text-sm font-medium mb-1">Genre</Label>
            <Input
              type="text"
              {...register('genre')}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          {errors.genre && <p className="text-red-500 text-sm">{errors.genre.message}</p>}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('available')}
              id="available"
            />
            <label htmlFor="available" className="text-sm">Available</label>
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1">Image</Label>
            <Input
              type="file"
              {...register('image')}
              className="w-full border rounded px-3 py-2"
            />
            {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
          </div>
          <Button
            type="submit"
            className="text-white px-4 py-2 rounded"
          >
            Add Book
          </Button>
        </form>
      </div>
    </ProtectedRoute>
  );
}