"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { SkeletonTable } from '@/components/ui/skeleton'
import DataTable from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context';

type Book = {
	id: string
	title: string
	author?: string
	publisher?: string
	genre?: string
	available?: boolean
	createdAt?: string
}

function useDebounced<T>(value: T, ms = 300) {
	const [v, setV] = useState(value)
	useEffect(() => {
		const t = setTimeout(() => setV(value), ms)
		return () => clearTimeout(t)
	}, [value, ms])
	return v
}

export default function DashboardPage() {
		const router = useRouter();
		const { user, logout } = useAuth();

		const [books, setBooks] = useState<Book[]>([])
	const [total, setTotal] = useState(0)
		const [loading, setLoading] = useState(false)
	const [page, setPage] = useState(1)
	const [perPage, setPerPage] = useState('10')
	const [q, setQ] = useState('')
	const dq = useDebounced(q, 350)

	const [genre, setGenre] = useState('')
	const [publisher, setPublisher] = useState('')
	const [author, setAuthor] = useState('')
	const [available, setAvailable] = useState('')

	// multi-sort: array of { field, dir: 'asc' | 'desc' }
	const [sorts, setSorts] = useState<Array<{ field: string; dir: 'asc' | 'desc' }>>([
		{ field: 'createdAt', dir: 'desc' },
	])

	const totalPages = Math.max(1, Math.ceil(total / Number(perPage)))

	const handleLogout = () => {
		logout();
		router.push('/auth/login');
	};

		const fetchBooks = async () => {
		const params = new URLSearchParams()
		params.set('page', String(page))
		params.set('pageSize', String(perPage))
		if (dq) params.set('q', dq)
		if (genre) params.set('genre', genre)
		if (publisher) params.set('publisher', publisher)
		if (author) params.set('author', author)
		if (available) params.set('available', available)
		if (sorts.length) params.set('sort', sorts.map((s) => `${s.field}:${s.dir}`).join(','))

			try {
				setLoading(true)
				const res = await fetch(`/api/books?${params.toString()}`)
				if (!res.ok) throw new Error('Failed')
				const data = await res.json()
				setBooks(data.items || [])
				setTotal(data.total || 0)
			} catch (err) {
				console.error(err)
			} finally {
				setLoading(false)
			}
	}

	useEffect(() => {
		// whenever filters, search, page, perPage, sorts change -> fetch
		fetchBooks()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dq, genre, publisher, author, available, page, perPage, sorts])

	function addSort(field: string) {
		setSorts((s) => {
			// if already exists, toggle dir
			const idx = s.findIndex((x) => x.field === field)
			if (idx >= 0) {
				const copy = [...s]
				copy[idx] = { field, dir: copy[idx].dir === 'asc' ? 'desc' : 'asc' }
				return copy
			}
			return [...s, { field, dir: 'asc' }]
		})
	}

	function removeSort(field: string) {
		setSorts((s) => s.filter((x) => x.field !== field))
	}

	async function exportCsv() {
		try {
			const res = await fetch('/api/books')
			const data = await res.json()
			const headers = ['id', 'title', 'author', 'publisher', 'genre', 'available']
					const rows = (data.items || []).map((b: Record<string, unknown>) =>
						headers
							.map((h) => {
								const v = b[h]
								return JSON.stringify(v ?? '')
							})
							.join(','),
					)
			const csv = [headers.join(','), ...rows].join('\n')
			const blob = new Blob([csv], { type: 'text/csv' })
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = 'books-export.csv'
			a.click()
			URL.revokeObjectURL(url)
		} catch (err) {
			console.error(err)
		}
	}

	const availableOptions = useMemo(() => [
		{ label: 'Any', value: 'any' },
		{ label: 'Available', value: 'true' },
		{ label: 'Not available', value: 'false' },
	], [])

	return (
		<ProtectedRoute>
			<div className="p-6 max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-6">
					<div>
						<h2 className="text-2xl font-semibold">Books dashboard</h2>
						{user && (
							<p className="text-sm text-gray-600 mt-1">
								Welcome, {user.first_name} {user.last_name} ({user.email})
							</p>
						)}
					</div>
					<Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
						Logout
					</Button>
				</div>

	      <div className="grid gap-3 md:grid-cols-4 mb-4">
	        <Input placeholder='Search books...' value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />

	        <Select value={genre} onValueChange={(value) => { setGenre(value); setPage(1); }}>
	          <SelectTrigger className="w-[180px]">
	            <SelectValue placeholder="All genres" />
	          </SelectTrigger>
	          <SelectContent>
	            <SelectGroup>
	              <SelectItem value="all">All genres</SelectItem>
	              <SelectItem value="Fiction">Fiction</SelectItem>
	              <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
	              <SelectItem value="Fantasy">Fantasy</SelectItem>
	              <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
	              <SelectItem value="Mystery">Mystery</SelectItem>
	            </SelectGroup>
	          </SelectContent>
	        </Select>

	        <Select value={publisher} onValueChange={(value) => { setPublisher(value); setPage(1); }}>
	          <SelectTrigger className="w-[180px]">
	            <SelectValue placeholder="All publishers" />
	          </SelectTrigger>
	          <SelectContent>
	            <SelectGroup>
	              <SelectItem value="all">All publishers</SelectItem>
	              <SelectItem value="ACME">ACME</SelectItem>
	              <SelectItem value="Orbit">Orbit</SelectItem>
	              <SelectItem value="Penguin">Penguin</SelectItem>
	              <SelectItem value="Harper">Harper</SelectItem>
	            </SelectGroup>
	          </SelectContent>
	        </Select>

	        <Select value={author} onValueChange={(value) => { setAuthor(value); setPage(1); }}>
	          <SelectTrigger className="w-[180px]">
	            <SelectValue placeholder="All authors" />
	          </SelectTrigger>
	          <SelectContent>
	            <SelectGroup>
	              <SelectItem value="all">All authors</SelectItem>
	              <SelectItem value="Alice">Alice</SelectItem>
	              <SelectItem value="Bob">Bob</SelectItem>
	              <SelectItem value="Carol">Carol</SelectItem>
	              <SelectItem value="David">David</SelectItem>
	            </SelectGroup>
	          </SelectContent>
	        </Select>
	      </div>

				<div className="flex items-center gap-3 mb-4">
	        {/* <Select value={available} onValueChange={(value) => { setAvailable(value); setPage(1); }}>
	          <SelectTrigger className="w-[180px]">
	            <SelectValue placeholder="Any" />
	          </SelectTrigger>
	          <SelectContent>
	            <SelectGroup>
	              {availableOptions.map((o) => (
	                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
	              ))}
	            </SelectGroup>
	          </SelectContent>
	        </Select> */}

	        <div className="flex items-center gap-2">
	          <Label>Per page:</Label>
	          <Select value={perPage} onValueChange={(value) => { setPerPage(value); setPage(1); }}>
	            <SelectTrigger className="w-[180px]">
	              <SelectValue placeholder="10" />
	            </SelectTrigger>
	            <SelectContent>
	              <SelectGroup>
	                <SelectItem value="5">5</SelectItem>
	                <SelectItem value="10">10</SelectItem>
	                <SelectItem value="20">20</SelectItem>
	                <SelectItem value="50">50</SelectItem>
	              </SelectGroup>
	            </SelectContent>
	          </Select>
	        </div>

	        <div className="ml-auto flex items-center gap-2">
	          <Button onClick={() => { setSorts([{ field: 'createdAt', dir: 'desc' }]) }} className="border">Reset sort</Button>
	          <Button onClick={() => addSort('title')} className="border">Sort title</Button>
	          <Button onClick={() => addSort('author')} className="border">Sort author</Button>
	          <Button onClick={() => exportCsv()} className="bg-slate-800 text-white">Export CSV</Button>
	        </div>
				</div>

	      {loading ? (
	        <SkeletonTable rows={Number(perPage)} />
	      ) : (
	        <DataTable
	          columns={[
	            { key: 'title', header: 'Title' },
	            { key: 'author', header: 'Author' },
	            { key: 'publisher', header: 'Publisher' },
	            { key: 'genre', header: 'Genre' },
	            { key: 'available', header: 'Available', render: (r) => (r.available ? 'Yes' : 'No') },
	            { key: 'createdAt', header: 'Created', render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '') },
	          ]}
	          data={books}
	        />
	      )}

				<div className="flex items-center justify-between gap-4 mt-4">
					<div>Showing {books.length} of {total}</div>
					<div className="flex items-center gap-2">
						<button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
						<span className="px-3 py-1 border rounded">{page} / {totalPages}</span>
						<button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border rounded">Next</button>
					</div>
				</div>

				<div className="mt-4">
					<div className="text-sm">Active sorts:</div>
					<div className="flex gap-2 mt-2">
						{sorts.map((s) => (
							<div key={s.field} className="px-2 py-1 border rounded flex items-center gap-2">
								<strong>{s.field}</strong>
								<span>{s.dir}</span>
								<button onClick={() => removeSort(s.field)} className="text-xs text-red-600">x</button>
							</div>
						))}
					</div>
				</div>

				<div className="flex justify-end mb-4">
					<Button onClick={() => router.push('/dashboard/new')} className="text-white px-4 py-2 rounded">Add Book</Button>
				</div>
			</div>
		</ProtectedRoute>
	)
}
