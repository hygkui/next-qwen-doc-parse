import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Save file to disk
    const uploadDir = path.join(process.cwd(), 'docs')
    const filePath = path.join(uploadDir, file.name)
    await writeFile(filePath, buffer)

    // Read file content for preview
    const content = buffer.toString('utf-8')
    
    return NextResponse.json({ 
      success: true,
      fileName: file.name,
      content,
      filePath
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
