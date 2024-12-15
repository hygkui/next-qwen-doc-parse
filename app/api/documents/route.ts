import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createDefaultUser } from '@/utils/auth';
import {
  calculateFileHash,
  checkDocumentExists,
  createDocument,
  updateDocumentContent,
  updateDocumentStatus
} from '@/utils/document';
import { parseDocument } from '@/utils/qwen';
import { db, testConnection } from '@/db';
import { eq, desc } from 'drizzle-orm';
import * as schema from '@/db/schema';

const { documents } = schema;

async function ensureDbConnection() {
  const isConnected = await testConnection();
  if (!isConnected) {
    throw new Error('数据库连接失败，请稍后重试');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Test database connection first
    await ensureDbConnection();

    let session = await auth();
    if (!session?.user) {
      const defaultUser = await createDefaultUser();
      session = { user: defaultUser };
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '请选择要上传的文件' }, { status: 400 });
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({
        error: '文件大小超出限制',
        details: '文件大小不能超过100MB'
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Calculate hash from binary buffer
    const fileHash = await calculateFileHash(buffer);
    const userId = session.user.id;
    const title = file.name;

    // Check if document already exists
    const existingDocument = await checkDocumentExists(userId, fileHash);
    if (existingDocument) {
      return NextResponse.json({
        message: '文件已存在',
        document: existingDocument
      }, { status: 200 });
    }

    // Parse document
    const parseResult = await parseDocument(file);

    if (parseResult.error) {
      const document = await createDocument({
        userId,
        title,
        fileHash,
        fileType: file.type,
        fileSize: file.size,
        status: 'error',
        originalContent: '',
        error: parseResult.error,
        totalPages: 0
      });

      return NextResponse.json({
        error: '文件解析失败',
        details: parseResult.error,
        document
      }, { status: 400 });
    }

    // Create document with parsed content
    const document = await createDocument({
      userId,
      title,
      fileHash,
      fileType: file.type,
      fileSize: file.size,
      originalContent: parseResult.content,
      status: 'processed',
      totalPages: parseResult.pageCount || 1
    });

    return NextResponse.json({
      message: '文件处理成功',
      document
    });

  } catch (error) {
    console.error('Request error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    const statusCode = errorMessage.includes('数据库连接失败') ? 503 : 500;

    return NextResponse.json({
      error: '请求处理失败',
      details: errorMessage
    }, { status: statusCode });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    await ensureDbConnection();

    let session = await auth();
    if (!session?.user) {
      const defaultUser = await createDefaultUser();
      session = { user: defaultUser };
    }

    const userDocuments = await db.query.documents.findMany({
      where: eq(documents.userId, session.user.id),
      orderBy: [desc(documents.createdAt)]
    });

    return NextResponse.json({ documents: userDocuments });
  } catch (error) {
    console.error('Error fetching documents:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    const statusCode = errorMessage.includes('数据库连接失败') ? 503 : 500;

    return NextResponse.json({
      error: '获取文档列表失败',
      details: errorMessage
    }, { status: statusCode });
  }
}
