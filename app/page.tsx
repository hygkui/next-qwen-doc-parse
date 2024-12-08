'use client'

import { useState } from 'react'
import AuthenticationModal from '@/components/AuthenticationModal'
import Layout from '@/components/Layout'
import FileUpload from '@/components/FileUpload'
import ChatInterface from '@/components/ChatInterface'
import ManualCorrection from '@/components/ManualCorrection'
import { useMenu } from './context/MenuContext'
import { Button } from '@/components/ui/button'
import DocumentsList from '@/components/DocumentsList'

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

  const handleContentEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditedContent(newContent);
    
    // Track changes by comparing with original content
    if (fileContent) {
      const originalLines = fileContent.split('\n');
      const newLines = newContent.split('\n');
      
      const changes: EditHistory[] = [];
      newLines.forEach((line, index) => {
        if (line !== originalLines[index]) {
          changes.push({
            position: index,
            oldText: originalLines[index] || '',
            newText: line
          });
        }
      });
      setEditHistory(changes);
    }
  };

  const renderPreview = () => {
    if (!fileContent) return null;

    const lines = (isEditMode ? editedContent : fileContent)?.split('\n') || [];
    const previewLines = showFullContent ? lines : lines.slice(0, 5);
    const hasMoreLines = lines.length > 5;

    const renderLine = (line: string, index: number) => {
      if (!isEditMode) return line;

        // Check if this line has been edited
        const editedLine = editHistory.find(edit => edit.position === index);
        return editedLine 
          ? <span className="text-red-600 underline decoration-red-600">{line}</span> 
          : line;
      };

    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">文件预览</h3>
          <div className="space-x-2">
            <Button
              onClick={() => setIsEditMode(!isEditMode)}
              variant="outline"
            >
              {isEditMode ? '预览模式' : '编辑模式'}
            </Button>
            <Button
              onClick={() => {
                setIsEditMode(true);
                setShowFullContent(true);
              }}
              variant="outline"
            >
              手动校对
            </Button>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          {isEditMode ? (
            <textarea
              value={editedContent || ''}
              onChange={handleContentEdit}
              className="w-full h-[200px] font-mono text-sm text-gray-600 p-2 border rounded"
            />
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-gray-600 mb-2">
              {previewLines.map((line, index) => (
                <div key={index}>
                  {renderLine(line, index)}
                </div>
              ))}
            </pre>
          )}
          {hasMoreLines && !isEditMode && (
            <Button
              onClick={() => setShowFullContent(!showFullContent)}
              variant="outline"
              className="mt-2"
            >
              {showFullContent ? '收起' : `显示更多 (共 ${lines.length} 行)`}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto p-4">
              <div className="flex flex-col space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">文件上传</h2>
                    <div className="space-x-2">
                      <FileUpload onUploadComplete={handleUploadComplete} />
                      <Button onClick={() => setIsEditMode(true)} variant="outline">
                        处理文件
                      </Button>
                    </div>
                  </div>
                  {fileContent && (
                    <div className="text-sm text-gray-600">
                      已选择文件: {uploadedDocId}
                    </div>
                  )}
                </div>

                {fileContent && (
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">文件内容</h3>
                      <div className="space-x-2">
                        <Button
                          onClick={() => setIsEditMode(!isEditMode)}
                          variant="outline"
                        >
                          {isEditMode ? '预览' : '编辑'}
                        </Button>
                        <Button
                          onClick={() => setShowFullContent(!showFullContent)}
                          variant="outline"
                        >
                          {showFullContent ? '收起' : '展开'}
                        </Button>
                      </div>
                    </div>

                    {isEditMode ? (
                      <ManualCorrection 
                        originalText={fileContent || ''}
                        onCorrection={(correctedText) => {
                          setEditedContent(correctedText)
                        }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap font-mono text-sm">
                        {renderPreview()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      case 'documents':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">文档列表</h2>
            <DocumentsList />
          </div>
        )
      case 'knowledge-base':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">知识库</h2>
            <div className="bg-white p-4 rounded-lg shadow">
              <p>知识库内容将在这里显示</p>
            </div>
          </div>
        )
      case 'conversation-history':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">会话记录</h2>
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
