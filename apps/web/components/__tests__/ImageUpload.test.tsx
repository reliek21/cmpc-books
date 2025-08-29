import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageUpload } from '../ImageUpload'

describe('ImageUpload', () => {
  const mockOnUpload = jest.fn()
  const defaultProps = {
    onUpload: mockOnUpload,
    loading: false,
  }

  beforeEach(() => {
    mockOnUpload.mockClear()
  })

  it('renders upload button when no image is provided', () => {
    render(<ImageUpload {...defaultProps} />)
    
    expect(screen.getByText('Upload Image')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders image when imageUrl is provided', () => {
    render(<ImageUpload {...defaultProps} imageUrl="/test-image.jpg" />)
    
    const image = screen.getByRole('img')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/test-image.jpg')
    expect(image).toHaveAttribute('alt', 'Book cover')
  })

  it('shows loading state when uploading', () => {
    render(<ImageUpload {...defaultProps} loading={true} />)
    
    expect(screen.getByText('Uploading...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onUpload when file is selected', async () => {
    const user = userEvent.setup()
    render(<ImageUpload {...defaultProps} />)
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')
    
    await user.upload(input, file)
    
    expect(mockOnUpload).toHaveBeenCalledWith(file)
  })

  it('shows error message when provided', () => {
    render(<ImageUpload {...defaultProps} error="Upload failed" />)
    
    expect(screen.getByText('Upload failed')).toBeInTheDocument()
    expect(screen.getByText('Upload failed')).toHaveClass('text-red-600')
  })

  it('accepts only image files', () => {
    render(<ImageUpload {...defaultProps} />)
    
    const input = screen.getByTestId('file-input')
    expect(input).toHaveAttribute('accept', 'image/*')
  })

  it('has proper accessibility attributes', () => {
    render(<ImageUpload {...defaultProps} />)
    
    const input = screen.getByTestId('file-input')
    const button = screen.getByRole('button')
    
    expect(input).toHaveAttribute('aria-label', 'Upload image file')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('shows change image button when image exists', () => {
    render(<ImageUpload {...defaultProps} imageUrl="/test-image.jpg" />)
    
    expect(screen.getByText('Change Image')).toBeInTheDocument()
  })

  it('handles file input change correctly', async () => {
    render(<ImageUpload {...defaultProps} />)
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input') as HTMLInputElement
    
    fireEvent.change(input, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(file)
    })
  })

  it('does not call onUpload when no file is selected', () => {
    render(<ImageUpload {...defaultProps} />)
    
    const input = screen.getByTestId('file-input')
    fireEvent.change(input, { target: { files: [] } })
    
    expect(mockOnUpload).not.toHaveBeenCalled()
  })
})
