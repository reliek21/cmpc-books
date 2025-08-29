import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BooksTable } from '../../components/dashboard/books-table'

// Mock DataTable component
jest.mock('../../components/ui/data-table', () => {
  return function DataTable({ data, columns, loading, emptyMessage }: any) {
    if (loading) {
      return <div>Loading...</div>
    }
    
    if (data.length === 0) {
      return <div>{emptyMessage}</div>
    }

    return (
      <div data-testid="data-table">
        <table>
          <thead>
            <tr>
              {columns.map((col: any, index: number) => (
                <th key={index}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item: any, rowIndex: number) => (
              <tr key={rowIndex}>
                {columns.map((col: any, colIndex: number) => (
                  <td key={colIndex}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
})

// Mock Button component
jest.mock('../../components/ui/button', () => ({
  Button: function Button({ children, onClick, disabled, className, ...props }: any) {
    return (
      <button 
        onClick={onClick} 
        disabled={disabled} 
        className={className}
        {...props}
      >
        {children}
      </button>
    )
  }
}))

describe('BooksTable', () => {
  const mockBooks = [
    {
      id: 1,
      title: 'Test Book 1',
      author: 'Test Author 1',
      publisher: 'Test Publisher 1',
      genre: 'Fiction',
      available: true,
      createdAt: '2023-01-01',
    },
    {
      id: 2,
      title: 'Test Book 2',
      author: 'Test Author 2',
      publisher: 'Test Publisher 2',
      genre: 'Non-Fiction',
      available: false,
      createdAt: '2023-01-02',
      deletedAt: '2023-01-03',
    },
  ]

  const mockProps = {
    books: mockBooks,
    loading: false,
    onDeleteBook: jest.fn(),
    onRestoreBook: jest.fn(),
    onForceDeleteBook: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders books table with default columns', () => {
    render(<BooksTable {...mockProps} />)

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Author')).toBeInTheDocument()
    expect(screen.getByText('Publisher')).toBeInTheDocument()
    expect(screen.getByText('Genre')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('displays book data correctly', () => {
    render(<BooksTable {...mockProps} />)

    expect(screen.getByText('Test Book 1')).toBeInTheDocument()
    expect(screen.getByText('Test Author 1')).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument() // Available
    expect(screen.getByText('No')).toBeInTheDocument()  // Not available
  })

  it('shows loading state', () => {
    render(<BooksTable {...mockProps} loading={true} />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows empty message when no books', () => {
    render(<BooksTable {...mockProps} books={[]} />)

    expect(screen.getByText('No books found')).toBeInTheDocument()
  })

  it('calls onDeleteBook when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<BooksTable {...mockProps} />)

    const deleteButtons = screen.getAllByText('Delete')
    await user.click(deleteButtons[0])

    expect(mockProps.onDeleteBook).toHaveBeenCalledWith(1)
  })

  it('shows disabled state while deleting', async () => {
    const user = userEvent.setup()
    // Mock a slow delete operation
    mockProps.onDeleteBook.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<BooksTable {...mockProps} />)

    const deleteButtons = screen.getAllByText('Delete')
    await user.click(deleteButtons[0])

    expect(screen.getByText('Deleting...')).toBeInTheDocument()
  })

  it('shows restore and force delete buttons for deleted books', () => {
    render(<BooksTable {...mockProps} showDeleted={true} />)

    expect(screen.getByText('Restore')).toBeInTheDocument()
    expect(screen.getByText('Delete Forever')).toBeInTheDocument()
  })

  it('calls onRestoreBook when restore button is clicked', async () => {
    const user = userEvent.setup()
    render(<BooksTable {...mockProps} showDeleted={true} />)

    const restoreButton = screen.getByText('Restore')
    await user.click(restoreButton)

    expect(mockProps.onRestoreBook).toHaveBeenCalledWith(1)
  })

  it('calls onForceDeleteBook when delete forever button is clicked', async () => {
    const user = userEvent.setup()
    render(<BooksTable {...mockProps} showDeleted={true} />)

    const forceDeleteButton = screen.getByText('Delete Forever')
    await user.click(forceDeleteButton)

    expect(mockProps.onForceDeleteBook).toHaveBeenCalledWith(1)
  })

  it('shows deleted at date when showDeleted is true', () => {
    render(<BooksTable {...mockProps} showDeleted={true} />)

    expect(screen.getByText('Deleted At')).toBeInTheDocument()
  })

  it('uses custom empty message when provided', () => {
    render(<BooksTable {...mockProps} books={[]} emptyMessage="Custom empty message" />)

    expect(screen.getByText('Custom empty message')).toBeInTheDocument()
  })

  it('renders custom columns when provided', () => {
    const customColumns = [
      { key: 'title', header: 'Book Title', sortable: true },
      { key: 'author', header: 'Book Author', sortable: true },
    ]

    render(<BooksTable {...mockProps} columns={customColumns} />)

    expect(screen.getByText('Book Title')).toBeInTheDocument()
    expect(screen.getByText('Book Author')).toBeInTheDocument()
    expect(screen.queryByText('Publisher')).not.toBeInTheDocument()
  })

  it('handles missing onDeleteBook prop gracefully', () => {
    const propsWithoutDelete = { ...mockProps }
    delete propsWithoutDelete.onDeleteBook

    render(<BooksTable {...propsWithoutDelete} />)

    // Should render without errors
    expect(screen.getByTestId('data-table')).toBeInTheDocument()
  })

  it('shows restoring state while restoring', async () => {
    const user = userEvent.setup()
    // Mock a slow restore operation
    mockProps.onRestoreBook.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<BooksTable {...mockProps} showDeleted={true} />)

    const restoreButton = screen.getByText('Restore')
    await user.click(restoreButton)

    expect(screen.getByText('Restoring...')).toBeInTheDocument()
  })
})
