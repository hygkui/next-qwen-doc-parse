'use client'

import { useState } from 'react'
import AuthenticationModal from '@/components/AuthenticationModal'
import Layout from '@/components/Layout'
import FileUpload from '@/components/FileUpload'
import ChatInterface from '@/components/ChatInterface'
import CorrectDocument from '@/components/CorrectDocument'
import { useMenu } from './context/MenuContext'
import { Button } from '@/components/ui/button'

interface EditHistory {
  position: number;
  oldText: string;
  newText: string;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [showFullContent, setShowFullContent] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editHistory, setEditHistory] = useState<EditHistory[]>([])
  const [editedContent, setEditedContent] = useState<string | null>(null)
  const { activeMenu } = useMenu()

  if (!isAuthenticated) {
    return <AuthenticationModal onAuthenticate={() => setIsAuthenticated(true)} />
  }

  const handleUploadComplete = (id: string, content?: string) => {
    setUploadedDocId(id)
    if (content) {
      setFileContent(content)
      setEditedContent(content)
      setShowFullContent(false)
      setEditHistory([])
      setIsEditMode(false)
    }
  }


  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
           return fileContent ? (
          <CorrectDocument 
            content={fileContent} 
            linesPerPage={30} 
          />
        ) : null;
      case 'chat':
        return <ChatInterface />;
      case 'documents':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">文档列表</h2>
            <p>文档列表功能开发中</p>
          </div>
        );
      case 'knowledge-base':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">知识库</h2>
            <div className="bg-white p-4 rounded-lg shadow">
              <p>知识库内容将在这里显示</p>
            </div>
          </div>
        );
      case 'conversation-history':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">会话记录</h2>
            <div className="bg-white p-4 rounded-lg shadow">
              <p>历史会话记录将在这里显示</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mt-4">
          {activeMenu === 'home' && <FileUpload onUploadComplete={handleUploadComplete} />}
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
}
