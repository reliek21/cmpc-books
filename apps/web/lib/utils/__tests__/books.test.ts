import {
  formatBookDate,
  getAvailabilityText,
  getAvailabilityColor,
  validateImageFile,
  createFormData,
  truncateText,
  generateBookSlug,
} from '../books'

describe('Book Utilities', () => {
  describe('formatBookDate', () => {
    it('should format valid date string', () => {
      const result = formatBookDate('2023-01-01')
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })

    it('should return N/A for undefined', () => {
      expect(formatBookDate()).toBe('N/A')
    })

    it('should return N/A for empty string', () => {
      expect(formatBookDate('')).toBe('N/A')
    })

    it('should return Invalid Date for invalid date', () => {
      expect(formatBookDate('invalid-date')).toBe('Invalid Date')
    })
  })

  describe('getAvailabilityText', () => {
    it('should return Yes for true', () => {
      expect(getAvailabilityText(true)).toBe('Yes')
    })

    it('should return No for false', () => {
      expect(getAvailabilityText(false)).toBe('No')
    })
  })

  describe('getAvailabilityColor', () => {
    it('should return green color for available', () => {
      expect(getAvailabilityColor(true)).toBe('text-green-600')
    })

    it('should return red color for not available', () => {
      expect(getAvailabilityColor(false)).toBe('text-red-600')
    })
  })

  describe('validateImageFile', () => {
    it('should return null for valid JPEG file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      expect(validateImageFile(file)).toBeNull()
    })

    it('should return null for valid PNG file', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      expect(validateImageFile(file)).toBeNull()
    })

    it('should return error for invalid file type', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      expect(validateImageFile(file)).toBe('Only image files (JPEG, PNG, GIF) are allowed')
    })

    it('should return error for file too large', () => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      expect(validateImageFile(largeFile)).toBe('Image size must be less than 5MB')
    })
  })

  describe('createFormData', () => {
    it('should create FormData with default field name', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const formData = createFormData(file)
      
      expect(formData.get('image')).toBe(file)
    })

    it('should create FormData with custom field name', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const formData = createFormData(file, 'customField')
      
      expect(formData.get('customField')).toBe(file)
    })
  })

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      expect(truncateText('Short text', 20)).toBe('Short text')
    })

    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated'
      expect(truncateText(longText, 20)).toBe('This is a very long ...')
    })

    it('should handle exact length', () => {
      expect(truncateText('Exact', 5)).toBe('Exact')
    })
  })

  describe('generateBookSlug', () => {
    it('should create slug from title', () => {
      expect(generateBookSlug('The Great Gatsby')).toBe('the-great-gatsby')
    })

    it('should handle special characters', () => {
      expect(generateBookSlug('Book: A Story!')).toBe('book-a-story')
    })

    it('should handle multiple spaces', () => {
      expect(generateBookSlug('Title   With   Spaces')).toBe('title-with-spaces')
    })

    it('should handle leading/trailing dashes', () => {
      expect(generateBookSlug('!@#Title$%^')).toBe('title')
    })
  })
})
