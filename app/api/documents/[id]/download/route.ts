import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createDefaultUser } from '@/utils/auth';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Packer, Document, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate UUID format
    if (!UUID_REGEX.test(params.id)) {
      console.error('Invalid UUID format:', params.id);
      return NextResponse.json(
        { error: 'Invalid document ID format' },
        { status: 400 }
      );
    }

    let session = await auth();
    if (!session?.user) {
      const defaultUser = await createDefaultUser();
      session = { user: defaultUser };
    }

    // Get download type from query params
    const { searchParams } = new URL(request.url);
    const downloadType = searchParams.get('type') || 'original';

    if (downloadType !== 'original' && downloadType !== 'corrected') {
      return NextResponse.json(
        { error: 'Invalid download type. Must be either "original" or "corrected"' },
        { status: 400 }
      );
    }

    console.log('Document ID:', params.id);
    console.log('User ID:', session.user.id);

    // Build the query
    const query = db.select({
      id: documents.id,
      title: documents.title,
      originalContent: documents.originalContent,
      corrections: documents.corrections,
      status: documents.status,
      fileType: documents.fileType
    }).from(documents)
      .where(eq(documents.id, params.id))
      .limit(1);

    // Log the SQL query
    console.log('SQL Query:', query.toSQL());

    // Execute the query
    const result = await query;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const doc = result[0];

    // Determine content to use
    let contentToUse = '';
    let contentType = downloadType === 'original' ? 'original' : 'corrected';

    if (downloadType === 'original') {
      contentToUse = doc.originalContent || '';
    } else if (doc.corrections) {
      try {
        const corrections = JSON.parse(doc.corrections);
        if (corrections && corrections.length > 0) {
          contentToUse = corrections.join('\n');
        } else {
          contentToUse = doc.originalContent || '';
          contentType = 'original';
        }
      } catch (parseError) {
        console.error('Failed to parse corrections:', parseError);
        contentToUse = doc.originalContent || '';
        contentType = 'original';
      }
    } else {
      contentToUse = doc.originalContent || '';
      contentType = 'original';
    }

    // Split content into paragraphs
    const contentParagraphs = contentToUse.split('\n').filter(Boolean);

    // Create DOCX document
    const docxDocument = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: doc.title || 'Untitled Document',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
              before: 400
            }
          }),

          // Content Type Header
          new Paragraph({
            children: [
              new TextRun({
                text: contentType === 'original' ? '原始内容' : '校对内容',
                bold: true,
                size: 28
              })
            ],
            spacing: {
              after: 200,
              before: 200
            }
          }),

          // Content Paragraphs
          ...contentParagraphs.map(text =>
            new Paragraph({
              children: [
                new TextRun({
                  text: text,
                  size: 24
                })
              ],
              spacing: {
                after: 200
              }
            })
          )
        ]
      }]
    });

    // Pack the document
    const buffer = await Packer.toBuffer(docxDocument);

    // Create filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${contentType}_${doc.title || 'document'}_${timestamp}.docx`;

    // Create response with proper headers
    const response = new NextResponse(buffer);
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    return response;

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download document' },
      { status: 500 }
    );
  }
}
