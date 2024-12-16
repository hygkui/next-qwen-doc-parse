import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { conversations } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15)

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params

    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1)

    if (conversation.length === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(conversation[0])
  } catch (error) {
    console.error('Failed to fetch conversation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params
    const body = await request.json()

    // Check if conversation exists
    const existingConversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1)

    // If conversation doesn't exist, create a new one
    if (existingConversation.length === 0) {
      const newConversation = await db
        .insert(conversations)
        .values({
          id: conversationId,
          title: body.title || '新对话',
          model: body.model || 'qwen-72b',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()

      return NextResponse.json(newConversation[0], { status: 201 })
    }

    // If conversation exists, return it
    return NextResponse.json(existingConversation[0])
  } catch (error) {
    console.error('创建或获取对话失败:', error)
    return NextResponse.json(
      { error: '创建或获取对话失败' },
      { status: 500 }
    )
  }
}
