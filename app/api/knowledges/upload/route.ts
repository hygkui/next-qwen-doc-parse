import { NextResponse } from 'next/server';
import { db } from '@/db';
import { knowledges } from '@/db/schema';
import { getSession } from '@/utils/auth';
import { parseDocument } from '@/lib/document-parser';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import os from 'os';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '请选择要上传的文件' },
        { status: 400 }
      );
    }

    // Create temp file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `upload-${uuidv4()}`);
    fs.writeFileSync(tempFilePath, buffer);

    try {
      // Parse document content
      const { content } = await parseDocument(buffer);

      // Insert into database
      const [knowledge] = await db.insert(knowledges).values({
        title: file.name,
        content: content,
        type: 'reference',
        tags: [],
        userId: session.userId || 'default', // Provide a default value if userId is undefined
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      return NextResponse.json(knowledge);
    } finally {
      // Clean up temp file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.error('Error cleaning up temp file:', e);
      }
    }
  } catch (error) {
    console.error('Error uploading knowledge document:', error);
    return NextResponse.json(
      { error: '上传知识库文档失败' },
      { status: 500 }
    );
  }
}
