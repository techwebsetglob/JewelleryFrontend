import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SecurityBoundary } from './components/SecurityBoundary'
import { freezePrototypes, preventFraming } from './security/contentSecurity'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

// Runtime security protections — executed before React renders
freezePrototypes()
preventFraming()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SecurityBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
            <Toaster position="bottom-right" toastOptions={{
              style: { background: '#1a1a1a', color: '#D4AF7F', border: '1px solid rgba(212,175,127,0.3)' }
            }} />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </SecurityBoundary>
  </StrictMode>,
)
