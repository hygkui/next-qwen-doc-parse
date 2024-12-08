'use client'

import { useState } from 'react'
import AuthenticationModal from '@/components/AuthenticationModal'
import Layout from '@/components/Layout'
import FileUpload from '@/components/FileUpload'
import DocumentPreview from '@/components/DocumentPreview'
import ChatInterface from '@/components/ChatInterface'
import ManualCorrection from '@/components/ManualCorrection'
import { useMenu } from './context/MenuContext'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null)
  const { activeMenu } = useMenu()

  if (!isAuthenticated) {
    return <AuthenticationModal onAuthenticate={() => setIsAuthenticated(true)} />
  }

  const handleUploadComplete = (id: string) => {
    setUploadedDocId(id)
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
        return (
          <div className="grid grid-cols-2 gap-4">
          <div>
            <FileUpload onUploadComplete={handleUploadComplete} />
            <DocumentPreview documentId={uploadedDocId} />
          </div>
          <div>
            <ChatInterface />
            <ManualCorrection />
          </div>
        </div>
          
        )
      case 'documents':
        return (
          <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Home</h2>
          {/* Add your home content here */}
          <div className="bg-white p-4 rounded-lg shadow">
            <p>主页内容将在这里显示</p>
          </div>
        </div>
        )
      case 'knowledge-base':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">知识库</h2>
            {/* Add your knowledge base content here */}
            <div className="bg-white p-4 rounded-lg shadow">
              <p>知识库内容将在这里显示</p>
            </div>
          </div>
        )
      case 'conversation-history':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">会话记录</h2>
            {/* Add your conversation history content here */}
            <div className="bg-white p-4 rounded-lg shadow">
              <p>历史会话记录将在这里显示</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Layout>
      {renderContent()}
    </Layout>
  )
}
