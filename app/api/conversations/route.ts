import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { conversations } from '@/db/schema'
import { desc } from 'drizzle-orm'

// GET all conversations
export async function GET() {
  try {
    const allConversations = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.createdAt))

    return NextResponse.json(allConversations)
  } catch (error) {
    console.error('Failed to fetch conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

// POST create a new conversation
export async function POST(request: NextRequest) {
  try {
    const { title, model } = await request.json()

    const newConversation = await db
      .insert(conversations)
      .values({
        title: title || '新对话',
        model: model || 'qwen-72b',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning()

    return NextResponse.json(newConversation[0], { status: 201 })
  } catch (error) {
    console.error('创建对话失败:', error)
    return NextResponse.json(
      { error: '创建对话失败' },
      { status: 500 }
    )
  }
}
