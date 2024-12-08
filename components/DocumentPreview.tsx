'use client'

import { useState, useEffect } from 'react'
import { getDocumentContent } from '@/app/api/documents'
import { ErrorModal } from '@/components/ErrorModal'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function DocumentPreview({ documentId }: { documentId: string | null }) {
  const [content, setContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (documentId) {
      setIsLoading(true)
      setError(null)
      getDocumentContent(documentId)
        .then((data) => {
          setContent(data.content)
          setIsLoading(false)
        })
        .catch((err) => {
          const errorMessage = err instanceof Error 
            ? err.message 
            : '无法加载文档内容'
          setError(errorMessage)
          setIsLoading(false)
          console.error(err)
        })
    }
  }, [documentId])

  if (!documentId) {
    return <div className="text-gray-500 p-4">未选择文档</div>
  }

  if (isLoading) {
    return <LoadingSpinner message="正在加载文档..." />
  }

  if (error) {
    return (
      <div className="p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">文档预览</h2>
        <ErrorModal 
          isOpen={!!error}
          onClose={() => setError(null)}
          title="加载错误"
          message={error || ''}
        />
      </div>
    )
  }

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">文档预览</h2>
      <pre className="whitespace-pre-wrap">{content}</pre>
    </div>
  )
}
