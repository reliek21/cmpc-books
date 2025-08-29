import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the useBooks hook
const mockUseBooks = {
  restoreBook: jest.fn(),
  forceDeleteBook: jest.fn(),
}

jest.mock('../../hooks/useBooks', () => ({
  useBooks: () => mockUseBooks,
}))

// Mock BooksTable component
jest.mock('../../components/dashboard/books-table', () => ({
  BooksTable: function MockBooksTable({ 
    books, 
    loading, 
    emptyMessage, 
    onRestoreBook, 
    onForceDeleteBook, 
    showDeleted 
  }: any) {
    return (
      <div data-testid="books-table">
        <div>Books: {books.length}</div>
        <div>Loading: {loading.toString()}</div>
        <div>Empty: {emptyMessage}</div>
        <div>Show Deleted: {showDeleted.toString()}</div>
        {books.map((book: any) => (
          <div key={book.id}>
            <span>{book.title}</span>
            <button onClick={() => onRestoreBook?.(book.id)}>Restore</button>
            <button onClick={() => onForceDeleteBook?.(book.id)}>Force Delete</button>
          </div>
        ))}
      </div>
    )
  },
}))

// Mock Button component
jest.mock('../../components/ui/button', () => ({
  Button: function MockButton({ children, onClick, variant }: any) {
    return (
      <button onClick={onClick} data-variant={variant}>
        {children}
      </button>
    )
  },
}))

// Import the component after mocking
import { DeletedBooksTable } from '../../components/dashboard/deleted-books-table'

describe('DeletedBooksTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('renders correctly with title and refresh button', () => {
    render(<DeletedBooksTable />)

    expect(screen.getByText('Deleted Books')).toBeInTheDocument()
    expect(screen.getByText('Refresh')).toBeInTheDocument()
  })

  it('fetches deleted books on mount', async () => {
    const mockBooks = [
      { id: 1, title: 'Deleted Book 1', deletedAt: '2023-01-01' },
      { id: 2, title: 'Deleted Book 2', deletedAt: '2023-01-02' },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBooks,
    })

    render(<DeletedBooksTable />)

    await waitFor(() => {
      expect(screen.getByText('Books: 2')).toBeInTheDocument()
    })

    expect(fetch).toHaveBeenCalledWith('/api/books/deleted')
  })

  it('handles fetch error gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(<DeletedBooksTable />)

    await waitFor(() => {
      expect(screen.getByText('Loading: false')).toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })

  it('shows loading state initially', () => {
    render(<DeletedBooksTable />)

    expect(screen.getByText('Loading: true')).toBeInTheDocument()
  })

  it('passes correct props to BooksTable', async () => {
    const mockBooks = [{ id: 1, title: 'Test Book' }]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBooks,
    })

    render(<DeletedBooksTable />)

    await waitFor(() => {
      expect(screen.getByText('Show Deleted: true')).toBeInTheDocument()
      expect(screen.getByText('Empty: No deleted books found')).toBeInTheDocument()
    })
  })

  it('handles restore book action', async () => {
    const mockBooks = [{ id: 1, title: 'Test Book' }]

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBooks,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

    mockUseBooks.restoreBook.mockResolvedValueOnce({})

    const user = userEvent.setup()
    render(<DeletedBooksTable />)

    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument()
    })

    const restoreButton = screen.getByText('Restore')
    await user.click(restoreButton)

    expect(mockUseBooks.restoreBook).toHaveBeenCalledWith(1)
  })

  it('handles force delete action', async () => {
    const mockBooks = [{ id: 1, title: 'Test Book' }]

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBooks,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

    mockUseBooks.forceDeleteBook.mockResolvedValueOnce({})

    const user = userEvent.setup()
    render(<DeletedBooksTable />)

    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument()
    })

    const forceDeleteButton = screen.getByText('Force Delete')
    await user.click(forceDeleteButton)

    expect(mockUseBooks.forceDeleteBook).toHaveBeenCalledWith(1)
  })

  it('refreshes data when refresh button is clicked', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    })

    const user = userEvent.setup()
    render(<DeletedBooksTable />)

    const refreshButton = screen.getByText('Refresh')
    await user.click(refreshButton)

    // Should have been called twice: once on mount, once on refresh
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('handles restore error gracefully', async () => {
    const mockBooks = [{ id: 1, title: 'Test Book' }]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBooks,
    })

    mockUseBooks.restoreBook.mockRejectedValueOnce(new Error('Restore failed'))

    // Mock console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const user = userEvent.setup()
    render(<DeletedBooksTable />)

    await waitFor(() => {
      expect(screen.getByText('Test Book')).toBeInTheDocument()
    })

    const restoreButton = screen.getByText('Restore')
    await user.click(restoreButton)

    expect(consoleSpy).toHaveBeenCalledWith('Error restoring book:', expect.any(Error))

    consoleSpy.mockRestore()
  })
})
