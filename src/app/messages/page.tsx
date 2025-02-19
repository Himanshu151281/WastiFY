'use client'
import { useState, useEffect, useRef } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Send, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY
    console.log('API Key:', API_KEY ? 'Present' : 'Missing')
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setError('')

    const newMessage: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, newMessage])
    setInput('')

    try {
      const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY
      if (!API_KEY) throw new Error('API key is missing')

      const genAI = new GoogleGenerativeAI(API_KEY)
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })

      console.log('Sending message:', newMessage.content)
      const result = await model.generateContent(newMessage.content)
      const responseText = result.response.text()
      console.log('Received response:', responseText)

      const assistantMessage: Message = { role: 'assistant', content: responseText }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="flex flex-col h-screen bg-black text-gray-200">
        {/* Chat container with scrolling */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[60%] px-4 py-2 rounded-lg ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
                }`}>
                  {/* Render Markdown properly */}
                  <ReactMarkdown className="text-sm">{msg.content}</ReactMarkdown>
                </div>
              </div>
          ))}
          <div ref={messagesEndRef}/>
        </div>

        {/* Stationary Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 bg-gray-800 border-t sticky bottom-0">
          <div className="flex items-center space-x-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow px-4 py-2 bg-gray-700 text-white border-none rounded-full focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isLoading}
            />
            <button
                type="submit"
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
            </button>
          </div>
        </form>
      </div>

  )
}