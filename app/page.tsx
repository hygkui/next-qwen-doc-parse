'use client'

import { useState } from 'react'
import AuthenticationModal from './components/AuthenticationModal'
import Layout from './components/Layout'
import FileUpload from './components/FileUpload'
import DocumentPreview from './components/DocumentPreview'
import ChatInterface from './components/ChatInterface'
import ManualCorrection from './components/ManualCorrection'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null)

  if (!isAuthenticated) {
    return <AuthenticationModal onAuthenticate={() => setIsAuthenticated(true)} />
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FileUpload onUploadSuccess={(id: string) => setUploadedDocId(id)} />
          <DocumentPreview documentId={uploadedDocId} />
        </div>
        <div>
          {/* <ChatInterface />
          <ManualCorrection /> */}
        </div>
      </div>
    </Layout>
  )
}

