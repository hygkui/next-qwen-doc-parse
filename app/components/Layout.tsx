'use client'

import { useState } from 'react'
import FileUpload from './FileUpload'
import DocumentPreview from './DocumentPreview'
import ChatInterface from './ChatInterface'
import ManualCorrection from './ManualCorrection'

export default function Layout() {
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">中文文本纠错</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FileUpload onUploadSuccess={(id: string) => setUploadedDocId(id)} />
          <DocumentPreview documentId={uploadedDocId} />
        </div>
        <div>
          <ChatInterface />
          <ManualCorrection />
        </div>
      </div>
    </div>
  )
}

