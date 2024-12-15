export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { createHash } from 'crypto'
import { db } from '@/db'
import { documents } from '@/db/schema'
import { auth } from '@/auth'
import { createDefaultUser } from '@/utils/auth'
import fs from 'fs'
import os from 'os'
import { parsePDFFile } from '@/utils/pdf-utils'

export async function POST(req: Request) {
  try {
    // Authenticate user
    let session = await auth();
    if (!session?.user) {
      const defaultUser = await createDefaultUser();
      session = { user: defaultUser };
    }

    const formData = await req.formData()
    const files = formData.getAll('file') as File[]

    if (!files.length) {
      return NextResponse.json(
        { error: '请选择要上传的文件' },
        { status: 400 }
      )
    }

    // Process each file
    const results = [];
    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const fileHash = createHash('md5').update(buffer).digest('hex')
        const documentId = uuidv4()

        // Save file to temp directory
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `${documentId}${path.extname(file.name)}`);
        fs.writeFileSync(tempFilePath, buffer);

        let content = '';
        let totalPages = 0;
        let metadata = null;
        const fileType = path.extname(file.name).toLowerCase();

        if (fileType === '.txt') {
          content = fs.readFileSync(tempFilePath, 'utf-8');
          // Round up the page count to nearest integer
          totalPages = Math.ceil(content.split('\n').length / 25); // Assuming 25 lines per page
        } else if (fileType === '.pdf') {
          try {
            throw new Error('不支持的文件格式。仅支持 .txt文件');
          } catch (pdfError) {
            console.error('PDF parsing error:', pdfError);
            throw new Error('PDF文件解析失败');
          }
        } else {
          throw new Error('不支持的文件格式。仅支持 .txt 和 .pdf 文件');
        }

        // Clean up temp file
        fs.unlinkSync(tempFilePath);

        // Save document to database using Drizzle
        await db.insert(documents).values({
          userId: session.user.id,
          title: file.name,
          fileHash,
          fileType,
          fileSize: file.size,
          totalPages,
          originalContent: content,
          metadata: metadata ? JSON.stringify(metadata) : null,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        results.push({
          fileName: file.name,
          success: true,
          documentId,
          metadata
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        results.push({
          fileName: file.name,
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }

    return NextResponse.json({
      message: '文件上传成功',
      results
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: '文件上传失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}
