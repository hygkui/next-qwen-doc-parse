'use client'

import { useState, useEffect } from 'react'
import { getDocumentContent } from '../api/documents'

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
        })
        .catch((err) => {
          setError('Failed to load document content')
          console.error(err)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [documentId])

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Document Preview</h2>
      <div className="border p-4 h-64 overflow-y-auto">
        {isLoading && <p>Loading document content...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {content && <pre className="whitespace-pre-wrap">{content}</pre>}
        {!documentId && <p>No document uploaded yet.</p>}
      </div>
    </div>
  )
}

