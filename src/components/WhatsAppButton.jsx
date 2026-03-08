import { useState, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER // e.g. "919876543210"

const QUICK_MESSAGES = [
  "I'd like to know more about a product",
  "I need help with my order",
  "I want to book a private consultation",
  "I have a question about customization",
]

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false)
  const [showPulse, setShowPulse] = useState(true)
  const [customMessage, setCustomMessage] = useState('')

  // Stop pulse animation after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  // Auto-open bubble after 30 seconds on page
  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 30000)
    return () => clearTimeout(timer)
  }, [])

  const sendMessage = (message) => {
    const text = encodeURIComponent(message || `Hello AURUM! I have a question.`)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank')
    setOpen(false)
  }

  return (
    <>
      {/* Chat bubble popup */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'rgba(15,15,15,0.97)',
            border: '1px solid rgba(212,175,127,0.25)',
            backdropFilter: 'blur(20px)',
            animation: 'slideUp 0.3s ease'
          }}
        >
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
               className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-serif text-lg font-bold">
                A
              </div>
              <div>
                <p className="text-white font-semibold text-sm">AURUM Support</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                  <p className="text-green-100 text-xs">Typically replies in minutes</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Chat preview bubble */}
          <div className="px-4 py-5">
            <div className="bg-[#1a1a1a] rounded-2xl rounded-tl-none px-4 py-3 mb-4 max-w-[85%]"
                 style={{ border: '1px solid rgba(212,175,127,0.1)' }}>
              <p className="text-gray-300 text-sm leading-relaxed">
                👋 Hello! Welcome to <span className="text-[#D4AF7F] font-semibold">AURUM</span>.<br />
                How can we assist you today?
              </p>
              <p className="text-gray-600 text-xs mt-1.5">AURUM Support · Just now</p>
            </div>

            {/* Quick message buttons */}
            <p className="text-gray-500 text-xs mb-2 px-1">Quick messages:</p>
            <div className="flex flex-col gap-2 mb-4">
              {QUICK_MESSAGES.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(msg)}
                  className="text-left text-xs px-3 py-2.5 rounded-xl text-[#D4AF7F] hover:bg-[#D4AF7F]/10 transition-all"
                  style={{ border: '1px solid rgba(212,175,127,0.2)' }}
                >
                  {msg}
                </button>
              ))}
            </div>

            {/* Custom message input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && customMessage && sendMessage(customMessage)}
                placeholder="Type a message..."
                className="flex-1 bg-[#1a1a1a] text-white text-sm px-3 py-2.5 rounded-xl outline-none placeholder-gray-600"
                style={{ border: '1px solid rgba(212,175,127,0.15)' }}
              />
              <button
                onClick={() => customMessage && sendMessage(customMessage)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

        {/* Tooltip label — shows when not open */}
        {!open && (
          <div
            className="px-3 py-1.5 rounded-lg text-xs text-[#D4AF7F] whitespace-nowrap"
            style={{
              background: 'rgba(15,15,15,0.9)',
              border: '1px solid rgba(212,175,127,0.2)',
              backdropFilter: 'blur(10px)',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            💬 Chat with us
          </div>
        )}

        {/* Main button */}
        <button
          onClick={() => setOpen(!open)}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
          aria-label="Chat on WhatsApp"
        >
          {/* Pulse ring */}
          {showPulse && (
            <span className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: 'rgba(37,211,102,0.4)' }} />
          )}

          {open
            ? <X size={22} color="white" />
            : <MessageCircle size={22} color="white" fill="white" />
          }

          {/* Notification dot */}
          {!open && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              1
            </span>
          )}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  )
}
