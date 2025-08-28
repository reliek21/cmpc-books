import { NextResponse } from 'next/server'

const globalDb: any = (global as any)._booksDb

export async function GET(req: Request, { params }: any) {
  const { id } = params
  const book = globalDb?.books?.find((b: any) => b.id === id)
  if (!book) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  return NextResponse.json(book)
}

export async function PUT(req: Request, { params }: any) {
  const { id } = params
  const bookIndex = globalDb?.books?.findIndex((b: any) => b.id === id)
  if (bookIndex === -1 || typeof bookIndex === 'undefined') return NextResponse.json({ message: 'Not found' }, { status: 404 })
  const body = await req.json().catch(() => ({}))
  const { title, author, publisher, genre, available, cover } = body
  const book = globalDb.books[bookIndex]
  Object.assign(book, { title, author, publisher, genre, available: !!available, cover })
  return NextResponse.json(book)
}

export async function DELETE(req: Request, { params }: any) {
  const { id } = params
  const bookIndex = globalDb?.books?.findIndex((b: any) => b.id === id)
  if (bookIndex === -1 || typeof bookIndex === 'undefined') return NextResponse.json({ message: 'Not found' }, { status: 404 })
  globalDb.books.splice(bookIndex, 1)
  return new NextResponse(null, { status: 204 })
}
