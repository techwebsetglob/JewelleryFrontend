import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const IDLE_TIMEOUT = 30 * 60 * 1000  // 30 minutes

export const useSessionGuard = () => {
  const { logout, currentUser } = useAuth()
  const navigate = useNavigate()
  const timer = useRef(null)

  const resetTimer = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        await logout()
      } catch {
        // ignore logout errors
      }
      navigate('/login?reason=session_expired')
    }, IDLE_TIMEOUT)
  }

  useEffect(() => {
    if (!currentUser) return
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer))
    resetTimer()
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      clearTimeout(timer.current)
    }
  }, [currentUser])
}
