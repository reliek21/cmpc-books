import { renderHook, waitFor } from '@testing-library/react'
import { useBooks } from '../useBooks'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('useBooks', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useBooks())

    expect(result.current.books).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.pagination.page).toBe(1)
    expect(result.current.pagination.perPage).toBe(10)
  })

  it('should fetch books on mount', async () => {
    const mockResponse = {
      items: [
        {
          id: 1,
          title: 'Test Book',
          author: 'Test Author',
          publisher: 'Test Publisher',
          genre: 'Fiction',
          available: true,
          createdAt: '2023-01-01',
        },
      ],
      total: 1,
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useBooks())

    await waitFor(() => {
      expect(result.current.books).toEqual(mockResponse.items)
      expect(result.current.total).toBe(1)
      expect(result.current.loading).toBe(false)
    })
  })

  it('should handle fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useBooks())

    await waitFor(() => {
      expect(result.current.error).toBe('Network error')
      expect(result.current.loading).toBe(false)
    })
  })

  it('should delete book successfully', async () => {
    const mockDeleteResponse = { success: true }
    const mockBooksResponse = {
      items: [],
      total: 0,
    }

    // First call for initial fetch
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [{ id: 1, title: 'Test' }], total: 1 }),
      })
      // Second call for delete
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDeleteResponse,
      })
      // Third call for refetch after delete
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBooksResponse,
      })

    const { result } = renderHook(() => useBooks())

    await waitFor(() => {
      expect(result.current.books).toHaveLength(1)
    })

    await result.current.deleteBook(1)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/books/1', {
        method: 'DELETE',
      })
    })
  })

  it('should restore book successfully', async () => {
    const mockRestoreResponse = { id: 1, title: 'Restored Book' }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [], total: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRestoreResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [mockRestoreResponse], total: 1 }),
      })

    const { result } = renderHook(() => useBooks())

    await result.current.restoreBook(1)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/books/1/restore', {
        method: 'POST',
      })
    })
  })

  it('should upload book image successfully', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const mockUploadResponse = { imageUrl: '/uploads/books/test.jpg' }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [], total: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUploadResponse,
      })

    const { result } = renderHook(() => useBooks())

    await result.current.uploadBookImage(1, mockFile)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/books/1/upload-image', {
        method: 'POST',
        body: expect.any(FormData),
      })
    })
  })

  it('should handle search filter changes', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    })

    const { result } = renderHook(() => useBooks())

    result.current.setSearch('test search')

    await waitFor(() => {
      expect(result.current.filters.q).toBe('test search')
    })
  })

  it('should handle pagination changes', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    })

    const { result } = renderHook(() => useBooks())

    result.current.setPage(2)

    await waitFor(() => {
      expect(result.current.pagination.page).toBe(2)
    })
  })

  it('should handle filter changes', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    })

    const { result } = renderHook(() => useBooks())

    result.current.setFilters({ genre: 'Fiction' })

    await waitFor(() => {
      expect(result.current.filters.genre).toBe('Fiction')
    })
  })

  it('should export CSV successfully', async () => {
    const mockBooksData = {
      items: [
        {
          id: 1,
          title: 'Test Book',
          author: 'Test Author',
          publisher: 'Test Publisher',
          genre: 'Fiction',
          available: true,
          createdAt: '2023-01-01',
        },
      ],
    }

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'mock-url')
    global.URL.revokeObjectURL = jest.fn()

    // Mock document.createElement and click
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn(),
    } as unknown as HTMLAnchorElement
    document.createElement = jest.fn(() => mockAnchor)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [], total: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBooksData,
      })

    const { result } = renderHook(() => useBooks())

    await result.current.exportCsv()

    expect(mockFetch).toHaveBeenCalledWith('/api/books?limit=1000')
    expect(mockAnchor.click).toHaveBeenCalled()
  })
})
