import { Component } from 'react'

// Catches JS errors and shows safe message instead of leaking stack traces
export class SecurityBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    // Log to your monitoring service — never expose to user
    console.error('[AURUM Error]', error.message)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#D4AF7F' }}>
          <h2>Something went wrong</h2>
          <p style={{ color: '#888' }}>Please refresh the page or contact support.</p>
          <button onClick={() => window.location.href = '/'}>Return Home</button>
        </div>
      )
    }
    return this.props.children
  }
}
