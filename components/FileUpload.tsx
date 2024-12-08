import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { uploadDocument } from '@/app/api/documents'
import { ErrorModal } from '@/components/ErrorModal'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface FileUploadProps {
  onUploadComplete: (id: string) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [mainDocument, setMainDocument] = useState<File | null>(null)
  const [referenceDocuments, setReferenceDocuments] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null)

  const handleMainDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainDocument(e.target.files[0])
    }
  }

  const handleReferenceDocumentsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setReferenceDocuments(prev => [...prev, ...filesArray])
    }
  }

  const handleUpload = async () => {
    if (!mainDocument) {
      setUploadError('Please select a main document to upload')
      return
    }

    setIsUploading(true)
    setUploadError(null)
    try {
      const uploadResponse = await uploadDocument(mainDocument)
      setUploadedDocId(uploadResponse.id)
      onUploadComplete(uploadResponse.id)
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Document upload failed, please try again'
      setUploadError(errorMessage)
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="mainDocument" className="block mb-2">
          Main Document
        </label>
        <Input 
          id="mainDocument"
          type="file" 
          onChange={handleMainDocumentUpload}
          disabled={isUploading}
        />
      </div>

      {mainDocument && (
        <div className="mt-4">
          <p>Selected file: {mainDocument.name}</p>
        </div>
      )}

      <div className="mt-4">
        {isUploading ? (
          <LoadingSpinner message="Uploading document..." />
        ) : (
          <Button 
            onClick={handleUpload} 
            disabled={!mainDocument}
          >
            Upload Document
          </Button>
        )}
      </div>

      <ErrorModal 
        isOpen={!!uploadError}
        onClose={() => setUploadError(null)}
        title="Upload Error"
        message={uploadError || ''}
      />
    </div>
  )
}
