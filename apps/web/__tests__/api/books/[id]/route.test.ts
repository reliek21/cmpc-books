import { NextRequest } from 'next/server'
import { DELETE, PATCH } from '../../../../app/api/books/[id]/route'

// Mock fetch
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('/api/books/[id] API Route', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001'
  })

  describe('DELETE method', () => {
    it('should delete book successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      const request = new NextRequest('http://localhost:3000/api/books/1', {
        method: 'DELETE',
      })

      const params = Promise.resolve({ id: '1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/books/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)
      expect(data).toEqual({ success: true })
    })

    it('should handle delete error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Book not found' }),
      } as Response)

      const request = new NextRequest('http://localhost:3000/api/books/1', {
        method: 'DELETE',
      })

      const params = Promise.resolve({ id: '1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Book not found' })
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const request = new NextRequest('http://localhost:3000/api/books/1', {
        method: 'DELETE',
      })

      const params = Promise.resolve({ id: '1' })
      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to delete book' })
    })
  })

  describe('PATCH method', () => {
    it('should update book successfully', async () => {
      const updateData = { title: 'Updated Title' }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...updateData }),
      } as Response)

      const request = new NextRequest('http://localhost:3000/api/books/1', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      })

      const params = Promise.resolve({ id: '1' })
      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/books/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      expect(response.status).toBe(200)
      expect(data).toEqual({ id: 1, ...updateData })
    })

    it('should handle update error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: 'Invalid data' }),
      } as Response)

      const request = new NextRequest('http://localhost:3000/api/books/1', {
        method: 'PATCH',
        body: JSON.stringify({ title: '' }),
      })

      const params = Promise.resolve({ id: '1' })
      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid data' })
    })
  })
})
