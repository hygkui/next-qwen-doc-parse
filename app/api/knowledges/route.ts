import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { knowledges } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/utils/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, content, type, tags } = await req.json();
    
    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Title, content, and type are required' },
        { status: 400 }
      );
    }

    // Save knowledge to database
    const [newKnowledge] = await db.insert(knowledges)
      .values({
        title,
        content,
        type,
        tags: tags || [],
        userId: session.userId
      })
      .returning();

    return NextResponse.json(newKnowledge, { status: 201 });
  } catch (error) {
    console.error('Error creating knowledge:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const documents = await db
      .select()
      .from(knowledges)
      .where(eq(knowledges.type, 'reference'))
      .orderBy(knowledges.createdAt);

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching reference documents:', error);
    return NextResponse.json(
      { error: '获取知识库文档失败' },
      { status: 500 }
    );
  }
}
