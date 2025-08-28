"use client"

import React, { useEffect, useMemo, useState } from 'react'

type Book = {
  id: string
  title: string
  author: string
  publisher: string
  genre: string
  available: boolean
  createdAt: string
}

function useDebounced(value: string, ms = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export function BookList() {
  const [books, setBooks] = useState<Book[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [q, setQ] = useState('')
  const dq = useDebounced(q, 350)
  const [genre, setGenre] = useState('')
  const [publisher, setPublisher] = useState('')
  const [author, setAuthor] = useState('')
  const [available, setAvailable] = useState('')
  const [sort, setSort] = useState('createdAt:desc')

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    if (dq) params.set('q', dq)
    if (genre) params.set('genre', genre)
    if (publisher) params.set('publisher', publisher)
    if (author) params.set('author', author)
    if (available) params.set('available', available)
    if (sort) params.set('sort', sort)

    fetch(`/api/books?${params.toString()}`).then((r) => r.json()).then((data) => {
      setBooks(data.items)
      setTotal(data.total)
    })
  }, [page, pageSize, dq, genre, publisher, author, available, sort])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="border px-2 py-1 rounded" />
        <select value={genre} onChange={(e) => setGenre(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">All genres</option>
          <option>Fiction</option>
          <option>Sci-Fi</option>
          <option>Fantasy</option>
          <option>Non-Fiction</option>
          <option>Mystery</option>
        </select>
        <select value={publisher} onChange={(e) => setPublisher(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">All publishers</option>
          <option>ACME</option>
          <option>Orbit</option>
          <option>Penguin</option>
          <option>Harper</option>
        </select>
        <select value={author} onChange={(e) => setAuthor(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">All authors</option>
          <option>Alice</option>
          <option>Bob</option>
          <option>Carol</option>
          <option>David</option>
        </select>
        <select value={available} onChange={(e) => setAvailable(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">Any</option>
          <option value="true">Available</option>
          <option value="false">Not available</option>
        </select>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm">Sort</label>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border px-2 py-1 rounded">
          <option value="createdAt:desc">Newest</option>
          <option value="createdAt:asc">Oldest</option>
          <option value="title:asc">Title A→Z</option>
          <option value="title:desc">Title Z→A</option>
        </select>
        <label className="text-sm">Per page</label>
        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} className="border px-2 py-1 rounded">
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left pb-2">Title</th>
            <th className="text-left pb-2">Author</th>
            <th className="text-left pb-2">Publisher</th>
            <th className="text-left pb-2">Genre</th>
            <th className="text-left pb-2">Available</th>
            <th className="text-left pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="py-2">{b.title}</td>
              <td className="py-2">{b.author}</td>
              <td className="py-2">{b.publisher}</td>
              <td className="py-2">{b.genre}</td>
              <td className="py-2">{b.available ? 'Yes' : 'No'}</td>
              <td className="py-2"><a className="text-indigo-600" href={`/books/${b.id}`}>Edit</a></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between mt-4">
        <div>Showing {books.length} of {total}</div>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
          <div className="px-3 py-1 border rounded">{page} / {totalPages || 1}</div>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
    </div>
  )
}

export default BookList
