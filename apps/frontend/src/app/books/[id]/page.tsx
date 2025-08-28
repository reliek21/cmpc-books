"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BookForm from '@/components/books/BookForm'

export default function EditBookPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [initial, setInitial] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    fetch(`/api/books/${id}`).then((r) => r.json()).then((d) => setInitial(d as Record<string, unknown>))
  }, [id])

  async function onSubmit(data: Record<string, unknown>) {
    const res = await fetch(`/api/books/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (!res.ok) throw new Error('Update failed')
    router.push('/books')
  }

  if (!initial) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit book</h1>
      <BookForm initial={initial} onSubmit={onSubmit} />
    </div>
  )
}
