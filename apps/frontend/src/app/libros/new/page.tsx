import React from 'react'
import BookForm from '@/components/books/BookForm'

export default function NewBookPage() {
  async function onSubmit(data: Record<string, unknown>) {
    const res = await fetch('/api/books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (!res.ok) throw new Error('Create failed')
    window.location.href = '/books'
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Create book</h1>
      <BookForm onSubmit={onSubmit} />
    </div>
  )
}
