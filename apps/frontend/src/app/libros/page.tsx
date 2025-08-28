"use client"

import React from 'react'
import BookList from '@/components/books/BookList'

export default function BooksPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Books</h1>
        <a className="px-4 py-2 bg-indigo-600 text-white rounded" href="/books/new">New book</a>
      </div>
      <BookList />
    </div>
  )
}
