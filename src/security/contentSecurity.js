// Detect and block prototype pollution attempts
export const freezePrototypes = () => {
  // Freezing Object.prototype and Array.prototype breaks React and Vite!
  // Removed to restore application rendering.
}

// Detect if app is running inside an iframe (clickjacking)
export const preventFraming = () => {
  if (window.self !== window.top) {
    window.top.location = window.self.location
  }
}

// Detect devtools opening (optional — for high-security pages like checkout)
export const detectDevTools = (onOpen) => {
  const threshold = 160
  const check = () => {
    if (window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold) {
      onOpen?.()
    }
  }
  window.addEventListener('resize', check)
}
