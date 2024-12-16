'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'

interface Conversation {
  id: string
  title: string
  createdAt: string
  messages: Array<{
    id: string
    content: string
    sender: 'user' | 'ai'
    timestamp: number
  }>
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [newConversationTitle, setNewConversationTitle] = useState('')
  const router = useRouter()

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/conversations')
        if (response.ok) {
          const data = await response.json()
          setConversations(data)
        }
      } catch (error) {
        console.error('获取对话列表失败:', error)
      }
    }

    fetchConversations()
  }, [])

  // Create new conversation
  const handleCreateConversation = async () => {
    if (!newConversationTitle.trim()) return

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newConversationTitle, model: 'qwen-72b' })
      })

      if (response.ok) {
        const newConversation = await response.json()
        router.push(`/conversations/${newConversation.id}`)
      }
    } catch (error) {
      console.error('创建对话失败:', error)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>开始新对话</CardTitle>
        </CardHeader>
        <CardContent className="flex space-x-2">
          <Input 
            value={newConversationTitle}
            onChange={(e) => setNewConversationTitle(e.target.value)}
            placeholder="输入对话标题"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateConversation()}
          />
          <Button onClick={handleCreateConversation}>
            创建对话
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">最近对话</h2>
        {conversations.length === 0 ? (
          <p className="text-gray-500">暂无对话</p>
        ) : (
          conversations.map((conversation) => (
            <Card key={conversation.id}>
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <h3 className="text-lg font-medium">{conversation.title}</h3>
                  <p className="text-sm text-gray-500">
                    创建时间：{new Date(conversation.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    消息数：{conversation.messages.length}
                  </p>
                </div>
                <Link href={`/conversations/${conversation.id}`}>
                  <Button variant="outline">
                    继续对话
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
