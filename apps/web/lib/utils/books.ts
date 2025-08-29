/**
 * Utility functions for book management
 */

export const formatBookDate = (dateString?: string): string => {
  if (!dateString) return 'N/A'
  
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return 'Invalid Date'
  }
}

export const getAvailabilityText = (available: boolean): string => {
  return available ? 'Yes' : 'No'
}

export const getAvailabilityColor = (available: boolean): string => {
  return available ? 'text-green-600' : 'text-red-600'
}

export const validateImageFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return 'Only image files (JPEG, PNG, GIF) are allowed'
  }

  if (file.size > maxSize) {
    return 'Image size must be less than 5MB'
  }

  return null
}

export const createFormData = (file: File, fieldName = 'image'): FormData => {
  const formData = new FormData()
  formData.append(fieldName, file)
  return formData
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const generateBookSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
