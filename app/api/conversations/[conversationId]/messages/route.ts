import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { conversations } from '@/db/schema'
import { eq } from 'drizzle-orm'

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15)

export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params
    const { message } = await request.json()

    // Fetch existing conversation
    const existingConversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1)

    if (existingConversation.length === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Prepare new message
    const userMessage = {
      id: generateId(),
      content: message,
      sender: 'user' as const,
      timestamp: Date.now()
    }

    // Prepare AI response
    const aiResponse = {
      id: generateId(),
      content: `You said: "${message}". This is a mock AI response.`,
      sender: 'ai' as const,
      timestamp: Date.now()
    }

    // Update conversation with new messages
    const updatedMessages = [
      ...(existingConversation[0].messages || []),
      userMessage,
      aiResponse
    ]

    await db
      .update(conversations)
      .set({
        messages: updatedMessages,
        updatedAt: new Date()
      })
      .where(eq(conversations.id, conversationId))

    return NextResponse.json({
      response: aiResponse.content,
      messages: updatedMessages
    })
  } catch (error) {
    console.error('Failed to process message:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
