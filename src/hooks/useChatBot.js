import { useState } from 'react'

// Uses standard Google Gemini API endpoint via Vite proxy or direct fetch
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const BASE_SYSTEM_PROMPT = `You are AURUM's luxury jewelry concierge — an AI assistant embedded on the AURUM website.

Your personality:
- Warm, elegant, and deeply knowledgeable about fine jewelry
- Speak like a refined luxury brand representative — sophisticated yet approachable
- Use jewelry terminology naturally (pavé, prong-set, hallmark, carat, clarity, cut, etc.)
- Keep responses concise (2–4 sentences) unless the user asks for more detail
- Use ✦ sparingly as a signature touch

AURUM Policies:
- Free shipping on all orders over $500
- 30-day returns on unworn items with original packaging
- Lifetime cleaning and inspection service for all AURUM pieces
- Custom engraving available on most pieces (allow 3–5 business days)
- Private in-store consultation available by appointment

Navigation guidance:
- To track an order → visit the /track page (or click "Track Order" in the navbar)
- To browse products → visit /shop
- To book a consultation → scroll to the Consultation section on the homepage
- To view orders / invoices → visit Account → My Orders

If you don't know something specific, honestly say so and offer to connect them with a human consultant at support@aurum-jewelry.com. Never invent prices, product details, or order statuses.`

// Build a dynamic context block from live data
const buildSystemPrompt = ({ products, user, orders }) => {
  let context = BASE_SYSTEM_PROMPT

  if (products && products.length > 0) {
    const productList = products
      .map(p => `  • ${p.name} — ${p.category} | $${p.price?.toLocaleString()} | ${p.material || 'Fine jewelry'} | ${p.inStock !== false ? 'In stock' : 'Out of stock'}`)
      .join('\n')
    context += `\n\n== LIVE AURUM PRODUCT CATALOG (${products.length} items) ==\n${productList}`
  }

  if (user) {
    context += `\n\n== CURRENT CUSTOMER ==\nName: ${user.displayName || 'Valued client'}\nEmail: ${user.email}`
  }

  if (orders && orders.length > 0) {
    const orderList = orders
      .slice(0, 5)
      .map(o => {
        const date = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : 'Recent'
        const status = o.currentStatus || o.status || 'pending'
        const items = (o.items || []).map(i => i.name).join(', ')
        return `  • Order ${o.orderId || o.id}: ${items} | Status: ${status} | Total: $${o.total?.toLocaleString()} | Placed: ${date}`
      })
      .join('\n')
    context += `\n\n== CUSTOMER'S RECENT ORDERS ==\n${orderList}\n(Use this to answer questions about their specific orders. For tracking details, direct them to the /track page.)`
  }

  return context
}

export const useChatBot = (context = {}) => {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: context.user
        ? `✦ Welcome back, ${context.user.displayName?.split(' ')[0] || 'there'}. How may I assist you today?`
        : "✦ Welcome to AURUM. I'm your personal jewelry concierge. How may I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim() || loading) return

    const userMsg = { role: 'user', content: userMessage, timestamp: new Date() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setLoading(true)
    setError(null)

    if (!GEMINI_API_KEY) {
      setError('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to .env')
      setLoading(false)
      return
    }

    try {
      // Gemini expects format: { role: 'user'|'model', parts: [{ text: '...' }] }
      // The first message in our state is the initial greeting, which is fine to send as history
      const contents = updatedMessages.map(({ role, content }) => ({
        role: role === 'assistant' ? 'model' : 'user',
        parts: [{ text: content }]
      }))

      const systemPrompt = buildSystemPrompt(context)

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              role: 'user',
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.7
            }
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || `API error ${response.status}`)
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "I'm sorry, I couldn't generate a response. Please try again."
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: reply, timestamp: new Date() },
      ])
    } catch (err) {
      console.error('[AURUM Chat Error]', err)
      setError(err.message)
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: "I'm sorry, I encountered an issue connecting. Please try again or email support@aurum-jewelry.com.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        content: context.user
          ? `✦ How else may I assist you, ${context.user.displayName?.split(' ')[0] || 'there'}?`
          : '✦ Welcome back. How may I assist you today?',
        timestamp: new Date(),
      },
    ])
    setError(null)
  }

  return { messages, loading, error, sendMessage, clearChat }
}
