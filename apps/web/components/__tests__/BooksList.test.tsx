import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BooksList from '../../src/components/BooksList'

// Mock the useBooks hook
jest.mock('../../hooks/useBooks', () => ({
  useBooks: jest.fn(),
}))

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function Image({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />
  }
})

const mockUseBooks = require('../../hooks/useBooks').useBooks

describe('BooksList', () => {
  const mockBooks = [
    {
      id: 1,
      title: 'Test Book 1',
      author: 'Test Author 1',
      publisher: 'Test Publisher 1',
      genre: 'Fiction',
      available: true,
      createdAt: '2023-01-01',
      imageUrl: '/test-image1.jpg',
    },
    {
      id: 2,
      title: 'Test Book 2',
      author: 'Test Author 2',
      publisher: 'Test Publisher 2',
      genre: 'Non-Fiction',
      available: false,
      createdAt: '2023-01-02',
    },
  ]

  const mockHookReturn = {
    books: mockBooks,
    total: 2,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      perPage: 10,
      total: 2,
      totalPages: 1,
    },
    filters: {
      q: '',
      genre: '',
      publisher: '',
      author: '',
      available: '',
    },
    setPage: jest.fn(),
    setPerPage: jest.fn(),
    setSearch: jest.fn(),
    setFilters: jest.fn(),
    deleteBook: jest.fn(),
    uploadBookImage: jest.fn(),
  }

  beforeEach(() => {
    mockUseBooks.mockReturnValue(mockHookReturn)
    jest.clearAllMocks()
  })

  it('renders books list correctly', () => {
    render(<BooksList />)

    expect(screen.getByText('Books Library')).toBeInTheDocument()
    expect(screen.getByText('Test Book 1')).toBeInTheDocument()
    expect(screen.getByText('Test Book 2')).toBeInTheDocument()
    expect(screen.getByText('Author: Test Author 1')).toBeInTheDocument()
    expect(screen.getByText('Publisher: Test Publisher 1')).toBeInTheDocument()
  })

  it('displays loading state', () => {
    mockUseBooks.mockReturnValue({
      ...mockHookReturn,
      loading: true,
    })

    render(<BooksList />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays error state', () => {
    mockUseBooks.mockReturnValue({
      ...mockHookReturn,
      error: 'Failed to load books',
    })

    render(<BooksList />)

    expect(screen.getByText('Error loading books: Failed to load books')).toBeInTheDocument()
  })

  it('displays no books message when list is empty', () => {
    mockUseBooks.mockReturnValue({
      ...mockHookReturn,
      books: [],
      total: 0,
    })

    render(<BooksList />)

    expect(screen.getByText('No books found matching your criteria.')).toBeInTheDocument()
  })

  it('handles search input correctly', async () => {
    const user = userEvent.setup()
    render(<BooksList />)

    const searchInput = screen.getByPlaceholderText('Search books...')
    await user.type(searchInput, 'test search')

    await waitFor(() => {
      expect(mockHookReturn.setSearch).toHaveBeenCalledWith('test search')
    })
  })

  it('handles genre filter change', async () => {
    const user = userEvent.setup()
    render(<BooksList />)

    const genreSelect = screen.getByDisplayValue('All Genres')
    await user.selectOptions(genreSelect, 'Fiction')

    expect(mockHookReturn.setFilters).toHaveBeenCalledWith({ genre: 'Fiction' })
  })

  it('handles delete book action', async () => {
    const user = userEvent.setup()
    render(<BooksList />)

    const deleteButtons = screen.getAllByText('Delete')
    await user.click(deleteButtons[0])

    expect(mockHookReturn.deleteBook).toHaveBeenCalledWith(1)
  })

  it('shows pagination when there are multiple pages', () => {
    mockUseBooks.mockReturnValue({
      ...mockHookReturn,
      pagination: {
        ...mockHookReturn.pagination,
        totalPages: 3,
      },
    })

    render(<BooksList />)

    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('handles page size change', async () => {
    const user = userEvent.setup()
    render(<BooksList />)

    const pageSizeSelect = screen.getByDisplayValue('10')
    await user.selectOptions(pageSizeSelect, '20')

    expect(mockHookReturn.setPerPage).toHaveBeenCalledWith('20')
  })

  it('displays book images when available', () => {
    render(<BooksList />)

    const bookImage = screen.getByAltText('Test Book 1 cover')
    expect(bookImage).toBeInTheDocument()
    expect(bookImage).toHaveAttribute('src', '/test-image1.jpg')
  })

  it('shows upload button for books without images', () => {
    render(<BooksList />)

    const uploadButtons = screen.getAllByText('Upload Image')
    expect(uploadButtons).toHaveLength(1) // Only for book 2 which has no image
  })

  it('displays availability status correctly', () => {
    render(<BooksList />)

    expect(screen.getByText('Yes')).toBeInTheDocument() // Available book
    expect(screen.getByText('No')).toBeInTheDocument()  // Not available book
  })

  it('handles image upload', async () => {
    const user = userEvent.setup()
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    render(<BooksList />)

    const fileInput = screen.getByTestId('file-input-2')
    await user.upload(fileInput, file)

    expect(mockHookReturn.uploadBookImage).toHaveBeenCalledWith(2, file)
  })

  it('shows results count correctly', () => {
    render(<BooksList />)

    expect(screen.getByText('Showing 2 of 2 books')).toBeInTheDocument()
    expect(screen.getByText('(Page 1 of 1)')).toBeInTheDocument()
  })

  it('renders link to deleted books page', () => {
    render(<BooksList />)

    const deletedBooksLink = screen.getByText('View Deleted Books')
    expect(deletedBooksLink).toBeInTheDocument()
    expect(deletedBooksLink.closest('a')).toHaveAttribute('href', '/books/deleted')
  })
})
