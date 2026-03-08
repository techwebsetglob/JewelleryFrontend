import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, RotateCcw } from 'lucide-react'
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useChatBot } from '../hooks/useChatBot'

const QUICK_MESSAGES = [
  "What rings do you have available?",
  "I need help with my order",
  "Tell me about your customization options",
  "I want to book a private consultation",
]

const formatTime = (date) =>
  date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

// ── Typing indicator ──────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-4">
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-black"
         style={{ background: 'linear-gradient(135deg, #D4AF7F, #c49b6b)' }}>A</div>
    <div className="px-4 py-3 rounded-2xl rounded-bl-none"
         style={{ background: 'rgba(212,175,127,0.08)', border: '1px solid rgba(212,175,127,0.15)' }}>
      <div className="flex gap-1.5 items-center h-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#D4AF7F]"
               style={{ animation: `aurumBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  </div>
)

// ── Message bubble ────────────────────────────────────────
const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user'
  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-black"
             style={{ background: 'linear-gradient(135deg, #D4AF7F, #c49b6b)' }}>A</div>
      )}
      <div className={`max-w-[80%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'rounded-br-none text-black' : 'rounded-bl-none text-gray-200'}`}
          style={isUser
            ? { background: 'linear-gradient(135deg, #D4AF7F, #c49b6b)' }
            : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,127,0.15)' }}
        >
          {message.content}
        </div>
        <span className="text-gray-600 text-[10px] px-1">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  )
}

// ── Main chatbot component ────────────────────────────────
export default function AurumChatBot() {
  const { currentUser } = useAuth()
  const [open, setOpen] = useState(false)
  const [showQuickMessages, setShowQuickMessages] = useState(true)
  const [input, setInput] = useState('')
  const [showPulse, setShowPulse] = useState(true)
  const [contextReady, setContextReady] = useState(false)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Build context object for the hook
  const chatContext = { products, user: currentUser, orders }
  const { messages, loading, sendMessage, clearChat } = useChatBot(chatContext)

  // Stop pulse after 5s
  useEffect(() => {
    const t = setTimeout(() => setShowPulse(false), 5000)
    return () => clearTimeout(t)
  }, [])

  // Fetch products + user orders once on mount
  useEffect(() => {
    const fetchContext = async () => {
      try {
        // Fetch all products (capped at 50)
        const productSnap = await getDocs(
          query(collection(db, 'products'), limit(50))
        )
        setProducts(productSnap.docs.map(d => ({ id: d.id, ...d.data() })))

        // Fetch user's orders if logged in
        if (currentUser) {
          const orderSnap = await getDocs(
            query(
              collection(db, 'orders'),
              where('userId', '==', currentUser.uid),
              limit(5)
            )
          )
          const fetched = orderSnap.docs.map(d => ({ id: d.id, ...d.data() }))
          fetched.sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() ?? 0
            const tb = b.createdAt?.toMillis?.() ?? 0
            return tb - ta
          })
          setOrders(fetched)
        }
      } catch (err) {
        console.warn('[AurumChatBot] Context fetch error:', err)
      } finally {
        setContextReady(true)
      }
    }
    fetchContext()
  }, [currentUser])

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const handleSend = async (text) => {
    const message = (text ?? input).trim()
    if (!message || loading) return
    setInput('')
    setShowQuickMessages(false)
    await sendMessage(message)
  }

  const handleClear = () => {
    clearChat()
    setShowQuickMessages(true)
    setInput('')
  }

  return (
    <>
      {/* ── CHAT WINDOW ── */}
      {open && (
        <div
          className="fixed z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl chat-widget-panel"
          style={{
            background: 'rgba(10,10,10,0.97)',
            border: '1px solid rgba(212,175,127,0.2)',
            backdropFilter: 'blur(24px)',
            animation: 'aurumSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Header */}
          <div className="chat-header">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-black text-sm"
                   style={{ background: 'linear-gradient(135deg, #D4AF7F, #c49b6b)' }}>A</div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-white text-sm font-semibold tracking-wide">AURUM Concierge</p>
                  <Sparkles size={12} className="text-[#D4AF7F]" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest">
                    {contextReady ? 'AI · Always available' : 'Loading context…'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleClear} title="New conversation"
                      className="chat-close-btn p-2 text-gray-400 hover:text-[#D4AF7F] transition-colors">
                <RotateCcw size={15} />
              </button>
              <button onClick={() => setOpen(false)}
                      className="chat-close-btn p-2 text-gray-400 hover:text-white transition-colors">
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(212,175,127,0.15) transparent' }}>
            {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
            {loading && <TypingIndicator />}

            {/* Quick suggestions — shown only on fresh chat */}
            {showQuickMessages && messages.length === 1 && !loading && (
              <div className="mt-1">
                <p className="text-gray-600 text-xs mb-2 px-1 uppercase tracking-widest">Suggested</p>
                <div className="chat-suggestions">
                  {QUICK_MESSAGES.map((msg, i) => (
                    <button key={i}
                            onClick={() => { setShowQuickMessages(false); handleSend(msg) }}
                            className="chat-suggestion-item text-left text-xs text-[#D4AF7F] hover:bg-[#D4AF7F]/10">
                      {msg}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="chat-input-area">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => {
                  setTimeout(() => {
                     inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                  }, 300);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="Ask about our collection…"
                rows={1}
                disabled={loading}
                className="flex-1 bg-transparent text-white text-sm px-4 py-3 rounded-xl outline-none placeholder-gray-600 resize-none disabled:opacity-50"
                style={{ border: '1px solid rgba(212,175,127,0.2)', background: 'rgba(255,255,255,0.03)', maxHeight: '80px' }}
              />
              <button onClick={() => handleSend()}
                      disabled={!input.trim() || loading}
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #D4AF7F, #c49b6b)' }}>
                <Send size={16} color="black" />
              </button>
            </div>
            <p className="text-center text-gray-700 text-[10px] mt-2 tracking-wider uppercase">
              Auram AI Assistant
            </p>
          </div>
        </div>
      )}

      {/* ── FLOATING BUTTON ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
        style={{ background: 'linear-gradient(135deg, #D4AF7F, #c49b6b)' }}
        aria-label="Open AURUM AI Chat"
      >
        {showPulse && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: '#D4AF7F' }} />
        )}
        {open ? <X size={22} color="black" /> : <Sparkles size={22} color="black" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center text-[#D4AF7F]"
                style={{ fontSize: '8px', fontWeight: 'bold', border: '1px solid rgba(212,175,127,0.4)' }}>
            AI
          </span>
        )}
      </button>

      <style>{`
        @keyframes aurumSlideUp {
          from { opacity:0; transform:translateY(24px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes aurumBounce {
          0%,80%,100% { transform:translateY(0); }
          40%          { transform:translateY(-6px); }
        }

        /* Desktop specific overriding for floating panel */
        .chat-widget-panel {
          bottom: 96px;
          right: 24px;
          width: 384px;
          height: 580px;
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          flex-shrink: 0;
          border-bottom: 1px solid rgba(212,175,127,0.15);
          background: rgba(212,175,127,0.04);
        }

        .chat-close-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          cursor: pointer;
          touch-action: manipulation;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          padding: 16px;
        }

        .chat-suggestions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 0 4px 12px;
        }

        .chat-suggestion-item {
          padding: 12px 14px;
          border: 1px solid rgba(212,175,127,0.2);
          border-radius: 10px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: background 0.2s ease;
          white-space: normal;
        }

        .chat-input-area {
          flex-shrink: 0;
          position: sticky;
          bottom: 0;
          background: inherit;
          padding: 12px 16px;
          border-top: 1px solid rgba(212,175,127,0.2);
        }

        @media (max-width: 768px) {
          .chat-widget-panel {
            position: fixed;
            bottom: 84px;
            right: 12px;
            left: 12px;
            width: auto;
            max-height: 65vh;
            height: 65vh;
          }
          
          .chat-input-area {
            background: rgba(10,10,10,0.97); /* Match parent to prevent transparency issues */
          }
        }
      `}</style>
    </>
  )
}
