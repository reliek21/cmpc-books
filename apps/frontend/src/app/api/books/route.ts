import { NextResponse } from 'next/server'

type Book = {
  id: string
  title: string
  author?: string
  publisher?: string
  genre?: string
  available?: boolean
  cover?: string
  createdAt?: string
}

type GlobalDb = { books: Book[] }
const globalDb = (global as unknown as { _booksDb?: GlobalDb })._booksDb || { books: [] }
if (!globalDb.books.length) {
  const genres = ['Fiction', 'Sci-Fi', 'Fantasy', 'Non-Fiction', 'Mystery']
  const publishers = ['ACME', 'Orbit', 'Penguin', 'Harper']
  const authors = ['Alice', 'Bob', 'Carol', 'David']
  for (let i = 1; i <= 57; i++) {
    globalDb.books.push({
      id: String(i),
      title: `Book ${i}`,
      author: authors[i % authors.length],
      publisher: publishers[i % publishers.length],
      genre: genres[i % genres.length],
      available: i % 3 !== 0,
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
    })
  }
  ;(global as any)._booksDb = globalDb
}

function applyFilters(items: Book[], q?: string, filters?: { genre?: string; publisher?: string; author?: string; available?: string | boolean } | undefined) {
  let out = items
  if (q) {
    const qq = q.toLowerCase()
    out = out.filter((b) => b.title.toLowerCase().includes(qq) || (b.author && b.author.toLowerCase().includes(qq)))
  }
  if (filters) {
    if (filters.genre) out = out.filter((b) => b.genre === filters.genre)
    if (filters.publisher) out = out.filter((b) => b.publisher === filters.publisher)
    if (filters.author) out = out.filter((b) => b.author === filters.author)
    if (typeof filters.available !== 'undefined') {
      const av = filters.available === 'true' || filters.available === true
      out = out.filter((b) => b.available === av)
    }
  }
  return out
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = Number(url.searchParams.get('page') || '1')
  const pageSize = Number(url.searchParams.get('pageSize') || '10')
  const q = url.searchParams.get('q') || undefined
  const genre = url.searchParams.get('genre') || undefined
  const publisher = url.searchParams.get('publisher') || undefined
  const author = url.searchParams.get('author') || undefined
  const available = url.searchParams.get('available') || undefined
  const sort = url.searchParams.get('sort') || undefined

  const filters = { genre, publisher, author, available }
  let items = applyFilters(globalDb.books, q, filters)

  if (sort) {
    const sorts = String(sort).split(',')
    items = items.slice().sort((a, b) => {
      for (const s of sorts) {
        const [field, dir] = s.split(':')
        const av = (a as unknown as Record<string, unknown>)[field]
        const bv = (b as unknown as Record<string, unknown>)[field]
        if (av == null || bv == null) continue
        if (av < bv) return dir === 'desc' ? 1 : -1
        if (av > bv) return dir === 'desc' ? -1 : 1
      }
      return 0
    })
  }

  const total = items.length
  const start = (Math.max(1, page) - 1) * pageSize
  const paged = items.slice(start, start + pageSize)

  return NextResponse.json({ total, items: paged })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>))
  const { title: t, author: a, publisher: p, genre: g, available: av, cover: c } = body as Record<string, unknown>
  const title = typeof t === 'string' ? t : ''
  if (!title) return NextResponse.json({ message: 'title required' }, { status: 400 })
  const author = typeof a === 'string' ? a : undefined
  const publisher = typeof p === 'string' ? p : undefined
  const genre = typeof g === 'string' ? g : undefined
  const available = av === true || av === 'true'
  const cover = typeof c === 'string' ? c : undefined
  const id = String(globalDb.books.length + 1)
  const book: Book = { id, title, author, publisher, genre, available, cover, createdAt: new Date().toISOString() }
  globalDb.books.unshift(book)
  return NextResponse.json(book, { status: 201 })
}
