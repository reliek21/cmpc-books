// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock global fetch
global.fetch = jest.fn()

// Mock DOM APIs not available in jsdom
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'mocked-object-url'),
})

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
})

// Mock document.createElement for anchor elements
const originalCreateElement = document.createElement
document.createElement = function(tagName, options) {
  if (tagName === 'a') {
    const element = originalCreateElement.call(this, tagName, options)
    element.click = jest.fn()
    return element
  }
  return originalCreateElement.call(this, tagName, options)
}

// Mock HTMLElement.appendChild to handle CSV export
const originalAppendChild = HTMLElement.prototype.appendChild
HTMLElement.prototype.appendChild = function(child) {
  if (child && child.nodeType === 1) { // Only append element nodes
    return originalAppendChild.call(this, child)
  }
  return child
}
