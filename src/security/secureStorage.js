// Never store raw sensitive data in localStorage
// This wrapper validates data structure on read and handles corruption

const STORAGE_VERSION = 'v1'

export const secureStorage = {
  set(key, value) {
    try {
      this.assertSafe(key)
      const payload = JSON.stringify({ version: STORAGE_VERSION, data: value, ts: Date.now() })
      localStorage.setItem(`aurum_${key}`, payload)
    } catch {
      // localStorage full or blocked — fail silently
    }
  },

  get(key) {
    try {
      const raw = localStorage.getItem(`aurum_${key}`)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (parsed.version !== STORAGE_VERSION) {
        this.remove(key)
        return null
      }
      return parsed.data
    } catch {
      this.remove(key)
      return null
    }
  },

  remove(key) {
    localStorage.removeItem(`aurum_${key}`)
  },

  // NEVER store these in localStorage — enforce it
  assertSafe(key) {
    const forbidden = ['password', 'token', 'secret', 'cvv', 'card', 'ssn']
    if (forbidden.some(f => key.toLowerCase().includes(f))) {
      throw new Error(`Security violation: "${key}" must not be stored in localStorage`)
    }
  }
}

// Safe cart storage — only store non-sensitive product data
export const cartStorage = {
  save(cartItems) {
    const safe = cartItems.map(({ id, name, price, qty, image, category }) => ({
      id, name, price, qty, image, category  // explicit whitelist — no sensitive fields
    }))
    secureStorage.set('cart', safe)
  },
  load() {
    return secureStorage.get('cart') || []
  },
  clear() {
    secureStorage.remove('cart')
  }
}
