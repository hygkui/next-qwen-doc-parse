import { NextResponse } from 'next/server'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: '请选择要上传的文件' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Read file content for preview and analysis
    const text = buffer.toString('utf-8')
    const documentId = uuidv4()
    
    // For now, we'll use a simple newline count for pages
    // In a real app, you'd want proper PDF/document parsing
    const totalPages = text.split('\n').length > 0 ? 
      Math.ceil(text.split('\n').length / 40) : 1
    
    return NextResponse.json({ 
      success: true,
      documentId,
      fileName: file.name,
      text,
      totalPages,
      fileSize: buffer.length
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    )
  }
}
