import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createDefaultUser } from '@/utils/auth';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let session = await auth();
    if (!session?.user) {
      const defaultUser = await createDefaultUser();
      session = { user: defaultUser };
    }

    const result = await db.select({
      id: documents.id,
      title: documents.title,
      originalContent: documents.originalContent,
      parsedContent: documents.parsedContent,
      corrections: documents.corrections,
      status: documents.status,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
      fileType: documents.fileType,
      fileSize: documents.fileSize,
      totalPages: documents.totalPages
    }).from(documents)
    .where(eq(documents.id, params.id))
    .where(eq(documents.userId, session.user.id))
    .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const doc = result[0];
    return NextResponse.json({
      id: doc.id,
      title: doc.title,
      originalContent: doc.originalContent,
      parsedContent: doc.parsedContent,
      corrections: doc.corrections ? JSON.parse(doc.corrections) : [],
      status: doc.status,
      fileName: doc.title,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      totalPages: doc.totalPages,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });

  } catch (error) {
    console.error('Document retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let session = await auth();
    if (!session?.user) {
      const defaultUser = await createDefaultUser();
      session = { user: defaultUser };
    }

    const body = await request.json();
    const { title, correction, corrections, status } = body;

    // Check if document exists and belongs to user
    const checkResult = await db.select({
      id: documents.id
    }).from(documents)
    .where(eq(documents.id, params.id))
    .where(eq(documents.userId, session.user.id))
    .limit(1);

    if (checkResult.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Update title if provided
    if (title) {
      await db.update(documents)
      .set({ title, updatedAt: new Date() })
      .where(eq(documents.id, params.id));
    }

    // Handle individual correction or full corrections
    if (correction || corrections) {
      const result = await db.select({
        corrections: documents.corrections
      }).from(documents)
      .where(eq(documents.id, params.id));
      
      const currentCorrections = result[0]?.corrections 
        ? JSON.parse(result[0].corrections) 
        : [];
      
      const newCorrections = correction 
        ? [...currentCorrections, correction]
        : corrections || currentCorrections;
      
      await db.update(documents)
      .set({ 
        corrections: JSON.stringify(newCorrections), 
        status: status || 'processed',
        updatedAt: new Date() 
      })
      .where(eq(documents.id, params.id));
    }

    // Get updated document
    const result = await db.select({
      id: documents.id,
      title: documents.title,
      originalContent: documents.originalContent,
      parsedContent: documents.parsedContent,
      corrections: documents.corrections,
      status: documents.status,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
      fileType: documents.fileType,
      fileSize: documents.fileSize,
      totalPages: documents.totalPages
    }).from(documents)
    .where(eq(documents.id, params.id))
    .limit(1);

    const doc = result[0];
    return NextResponse.json({
      id: doc.id,
      title: doc.title,
      originalContent: doc.originalContent,
      parsedContent: doc.parsedContent,
      corrections: doc.corrections ? JSON.parse(doc.corrections) : [],
      status: doc.status,
      fileName: doc.title,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      totalPages: doc.totalPages,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });

  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
