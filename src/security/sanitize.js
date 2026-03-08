import DOMPurify from 'dompurify'

// Sanitize any string before rendering or sending to API
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str
  return DOMPurify.sanitize(str.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

// Sanitize entire object recursively (use before every API call)
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  const clean = {}
  for (const key in obj) {
    const value = obj[key]
    if (typeof value === 'string') clean[key] = sanitizeString(value)
    else if (typeof value === 'object') clean[key] = sanitizeObject(value)
    else clean[key] = value
  }
  return clean
}

// Safe render helper — use instead of dangerouslySetInnerHTML everywhere
export const safeHTML = (dirty) => ({
  __html: DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: []
  })
})

// Strip all operator injection attempts from user input
export const stripInjection = (value) => {
  if (typeof value !== 'string') return value
  return value
    .replace(/[${}]/g, '')       // NoSQL operators
    .replace(/<[^>]*>/g, '')     // HTML tags
    .replace(/\0/g, '')          // null bytes
    .replace(/javascript:/gi, '') // JS protocol
    .trim()
}
