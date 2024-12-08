'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import ManualCorrectionModal from '@/components/ManualCorrectionModal'

interface Document {
  id: string
  name: string
  createdAt: string
}

export default function DocumentsList() {
  const [documents] = useState<Document[]>([
    { id: '1', name: 'Document 1', createdAt: '2023-05-01' },
    { id: '2', name: 'Document 2', createdAt: '2023-05-02' },
    { id: '3', name: 'Document 3', createdAt: '2023-05-03' },
  ])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  const openModal = (document: Document) => {
    setSelectedDocument(document)
  }

  const closeModal = () => {
    setSelectedDocument(null)
  }

  return (
    <div>
      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <div>
              <h3 className="font-medium">{doc.name}</h3>
              <p className="text-sm text-gray-500">Created: {doc.createdAt}</p>
            </div>
            <Button 
              onClick={() => openModal(doc)}
              className="bg-[#14171F] text-white hover:bg-[#14171F]/90"
            >
              View Corrections
            </Button>
          </div>
        ))}
      </div>
      {selectedDocument && (
        <ManualCorrectionModal document={selectedDocument} onClose={closeModal} />
      )}
    </div>
  )
}
