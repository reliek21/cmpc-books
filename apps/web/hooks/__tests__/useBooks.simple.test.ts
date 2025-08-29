import { renderHook, act, waitFor } from '@testing-library/react'
import { useBooks } from '../useBooks'

// Mock fetch globally
global.fetch = jest.fn()

describe('useBooks Hook - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useBooks())

    expect(result.current.books).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.loading).toBe(true) // Initially loading
    expect(result.current.error).toBe(null)
    expect(result.current.pagination.page).toBe(1)
    expect(result.current.pagination.perPage).toBe(10)
  })

  it('should have required methods', () => {
    const { result } = renderHook(() => useBooks())

    expect(typeof result.current.deleteBook).toBe('function')
    expect(typeof result.current.restoreBook).toBe('function')
    expect(typeof result.current.forceDeleteBook).toBe('function')
    expect(typeof result.current.uploadBookImage).toBe('function')
    expect(typeof result.current.setSearch).toBe('function')
    expect(typeof result.current.setFilters).toBe('function')
    expect(typeof result.current.setPage).toBe('function')
    expect(typeof result.current.setPerPage).toBe('function')
  })

  it('should handle search functionality', async () => {
    const { result } = renderHook(() => useBooks())

    act(() => {
      result.current.setSearch('test search')
    })

    expect(result.current.filters.q).toBe('test search')
    expect(result.current.pagination.page).toBe(1) // Should reset to page 1
  })

  it('should handle pagination', async () => {
    const { result } = renderHook(() => useBooks())

    act(() => {
      result.current.setPage(2)
    })

    expect(result.current.pagination.page).toBe(2)
  })

  it('should handle per page changes', async () => {
    const { result } = renderHook(() => useBooks())

    act(() => {
      result.current.setPerPage('20')
    })

    expect(result.current.pagination.perPage).toBe(20)
    expect(result.current.pagination.page).toBe(1) // Should reset to page 1
  })

  it('should handle filter changes', async () => {
    const { result } = renderHook(() => useBooks())

    act(() => {
      result.current.setFilters({ genre: 'Fiction', author: 'Test Author' })
    })

    expect(result.current.filters.genre).toBe('Fiction')
    expect(result.current.filters.author).toBe('Test Author')
    expect(result.current.pagination.page).toBe(1) // Should reset to page 1
  })

  it('should fetch books on mount', async () => {
    const mockResponse = {
      items: [
        { id: 1, title: 'Test Book 1', author: 'Author 1' },
        { id: 2, title: 'Test Book 2', author: 'Author 2' }
      ],
      total: 2,
      page: 1,
      totalPages: 1
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useBooks())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.books).toEqual(mockResponse.items)
    expect(result.current.total).toBe(2)
    expect(global.fetch).toHaveBeenCalled()
  })

  it('should handle fetch errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch')
    )

    const { result } = renderHook(() => useBooks())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch')
    expect(result.current.books).toEqual([])
  })

  it('should export CSV', async () => {
    // Mock the CSV export functionality
    const mockBooks = [
      { id: 1, title: 'Book 1', author: 'Author 1', price: 10 }
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: mockBooks, total: 1 }),
    })

    const { result } = renderHook(() => useBooks())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.exportCsv()
    })

    // The function should complete without errors
    expect(result.current.error).toBe(null)
  })
})
