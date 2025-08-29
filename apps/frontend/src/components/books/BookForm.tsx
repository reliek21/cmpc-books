"use client"

import React, { useState } from 'react'


type Props = {
  initial?: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
}

export function BookForm({ initial = {}, onSubmit }: Props) {
  const [title, setTitle] = useState(initial.title || '')
  const [author, setAuthor] = useState(initial.author || '')
  const [publisher, setPublisher] = useState(initial.publisher || '')
  const [genre, setGenre] = useState(initial.genre || '')
  const [available, setAvailable] = useState(!!initial.available)
  const [cover, setCover] = useState<string | undefined>(initial.cover)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      setCover(String(reader.result))
    }
    reader.readAsDataURL(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const parsed = schema.safeParse({ title, author, publisher, genre, available })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Invalid')
      return
    }
    setLoading(true)
    try {
      await onSubmit({ title, author, publisher, genre, available, cover })
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? (err as any).message : null
      setError(msg || 'Submit failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-lg">
      {error && <div className="text-red-600">{error}</div>}

      <div>
        <label className="block text-sm">Title</label>
        <input className="w-full border px-2 py-1" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm">Author</label>
        <input className="w-full border px-2 py-1" value={author} onChange={(e) => setAuthor(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm">Publisher</label>
        <input className="w-full border px-2 py-1" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm">Genre</label>
        <input className="w-full border px-2 py-1" value={genre} onChange={(e) => setGenre(e.target.value)} />
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2"><input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /> Available</label>
      </div>

      <div>
        <label className="block text-sm">Cover image</label>
        <input type="file" accept="image/*" onChange={handleImage} />
        {cover && <img src={cover} alt="cover" className="mt-2 max-h-40" />}
      </div>

      <div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

export default BookForm
