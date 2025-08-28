import { NextResponse } from 'next/server'

type GlobalDb = { books: Record<string, unknown>[] }
const globalDb = (global as unknown as { _booksDb?: GlobalDb })._booksDb as GlobalDb | undefined

export async function GET(req: Request, { params }: { params: { id: string } | Promise<{ id: string }> }) {
  const maybePromise = params as unknown as Promise<{ id: string }>
  const resolved = (maybePromise && typeof maybePromise.then === 'function') ? await maybePromise : params as { id: string }
  const { id } = resolved as { id: string }
  const book = globalDb?.books?.find((b) => (b as unknown as { id: string }).id === id)
  if (!book) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  return NextResponse.json(book)
}

export async function PUT(req: Request, { params }: { params: { id: string } | Promise<{ id: string }> }) {
  const maybePromise = params as unknown as Promise<{ id: string }>
  const resolved = (maybePromise && typeof maybePromise.then === 'function') ? await maybePromise : params as { id: string }
  const { id } = resolved as { id: string }
  const bookIndex = globalDb?.books?.findIndex((b) => (b as unknown as { id: string }).id === id)
  if (bookIndex === -1 || typeof bookIndex === 'undefined') return NextResponse.json({ message: 'Not found' }, { status: 404 })
  const body = await req.json().catch(() => ({} as Record<string, unknown>))
  const { title, author, publisher, genre, available, cover } = body as Record<string, unknown>
  const book = globalDb!.books[bookIndex]
  Object.assign(book, { title, author, publisher, genre, available: !!available, cover })
  return NextResponse.json(book)
}

export async function DELETE(req: Request, { params }: { params: { id: string } | Promise<{ id: string }> }) {
  const maybePromise = params as unknown as Promise<{ id: string }>
  const resolved = (maybePromise && typeof maybePromise.then === 'function') ? await maybePromise : params as { id: string }
  const { id } = resolved as { id: string }
  const bookIndex = globalDb?.books?.findIndex((b) => (b as unknown as { id: string }).id === id)
  if (bookIndex === -1 || typeof bookIndex === 'undefined') return NextResponse.json({ message: 'Not found' }, { status: 404 })
  globalDb!.books.splice(bookIndex, 1)
  return new NextResponse(null, { status: 204 })
}
