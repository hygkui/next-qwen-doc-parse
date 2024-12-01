import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Message {
  role: 'user' | 'ai'
  content: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: 'user', content: input }])
      // Here you would typically send the message to the AI and get a response
      // For now, we'll just simulate an AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', content: 'AI response to: ' + input }])
      }, 1000)
      setInput('')
    }
  }

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Chat with AI</h2>
      <div className="border p-4 h-64 overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {message.content}
            </span>
          </div>
        ))}
      </div>
      <div className="flex">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow mr-2"
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  )
}

