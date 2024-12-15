import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { knowledges } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/utils/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const [knowledge] = await db.select()
      .from(knowledges)
      .where(
        and(
          eq(knowledges.id, id),
          eq(knowledges.userId, session.userId)
        )
      )
      .limit(1);

    if (!knowledge) {
      return NextResponse.json(
        { error: 'Knowledge not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(knowledge);
  } catch (error) {
    console.error('Error fetching knowledge:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, content } = await req.json();
    const { id } = params;

    if (!name || !content) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      );
    }

    const [updatedKnowledge] = await db.update(knowledges)
      .set({
        name,
        content,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(knowledges.id, id),
          eq(knowledges.userId, session.userId)
        )
      )
      .returning();

    if (!updatedKnowledge) {
      return NextResponse.json(
        { error: 'Knowledge not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedKnowledge);
  } catch (error) {
    console.error('Error updating knowledge:', error);
    return NextResponse.json(
      { error: 'Failed to update knowledge' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const [deletedKnowledge] = await db.delete(knowledges)
      .where(
        and(
          eq(knowledges.id, id),
          eq(knowledges.userId, session.userId)
        )
      )
      .returning();

    if (!deletedKnowledge) {
      return NextResponse.json(
        { error: 'Knowledge not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(deletedKnowledge);
  } catch (error) {
    console.error('Error deleting knowledge:', error);
    return NextResponse.json(
      { error: 'Failed to delete knowledge' },
      { status: 500 }
    );
  }
}
