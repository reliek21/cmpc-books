import '@testing-library/jest-dom'

// Configure React Testing Library to work with React 18+
// This helps avoid act() warnings
import { configure } from '@testing-library/react'

configure({
  testIdAttribute: 'data-testid',
  // Reduce the default timeout to speed up tests
  asyncUtilTimeout: 5000,
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/test-path',
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    const { src, alt, ...rest } = props
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...rest} />
  },
}))

// Global test setup
beforeEach(() => {
  // Clear all fetch mocks
  if (global.fetch) {
    global.fetch.mockClear()
  }
})

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks()
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock next/link
jest.mock('next/link', () => {
  return function Link({ children, href, ...props }) {
    return React.createElement('a', { href, ...props }, children)
  }
})

// Global fetch mock
global.fetch = jest.fn()

// Mock window.confirm
global.confirm = jest.fn(() => true)

// Mock window.alert
global.alert = jest.fn()

// Mock URL methods
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

// Setup for each test
beforeEach(() => {
  fetch.mockClear()
  confirm.mockClear()
  alert.mockClear()
})
