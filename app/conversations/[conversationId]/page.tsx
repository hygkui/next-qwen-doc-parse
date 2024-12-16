'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: number
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.conversationId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [conversationTitle, setConversationTitle] = useState('对话')
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load conversation history on component mount
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}/history`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
          setConversationTitle(data.title || '对话')
          setError(null)
        } else if (response.status === 404) {
          // Conversation not found, create a new one
          const createResponse = await fetch('/api/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              title: `新对话 - ${conversationId}`,
              model: 'qwen-72b'
            })
          })

          if (createResponse.ok) {
            const newConversation = await createResponse.json()
            // Update URL to the newly created conversation
            router.replace(`/conversations/${newConversation.id}`)
          } else {
            setError('无法创建新对话')
          }
        } else {
          setError('加载对话失败')
        }
      } catch (error) {
        console.error('Failed to load conversation:', error)
        setError('网络错误，无法加载对话')
      }
    }

    loadConversation()
  }, [conversationId, router])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const newUserMessage: Message = {
      id: Math.random().toString(36).substring(2, 15),
      content: inputMessage,
      sender: 'user',
      timestamp: Date.now()
    }

    // Optimistically add user message
    setMessages(prev => [...prev, newUserMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputMessage,
          conversationId 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      // Add AI response
      const aiMessage: Message = {
        id: Math.random().toString(36).substring(2, 15),
        content: data.response,
        sender: 'ai',
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error in conversation:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: Math.random().toString(36).substring(2, 15),
        content: '对话出现错误，请稍后重试',
        sender: 'ai',
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Render error if exists
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          onClick={() => router.push('/conversations')}
          className="mr-4"
        >
          返回会话列表
        </Button>
      </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">错误：</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          onClick={() => router.push('/conversations')}
          className="mr-4"
        >
          返回会话列表
        </Button>
      </div>
      <Card>
        <CardContent>
          <div className="space-y-4">
            <h1 className="text-xl m-4 font-semibold">{conversationTitle}</h1>
            <div className="h-96 overflow-y-auto border rounded p-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`mb-2 p-2 rounded ${
                    msg.sender === 'user' 
                      ? 'bg-blue-100 text-right' 
                      : 'bg-green-100 text-left'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2 px-4">
              <Input 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="输入您的消息..."
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !inputMessage.trim()}
              >
                {isLoading ? '发送中...' : '发送'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
