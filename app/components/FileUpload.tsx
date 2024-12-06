import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { uploadDocument } from '../api/documents'

interface FileUploadProps {
  onUploadSuccess: (id: string) => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [mainDocument, setMainDocument] = useState<File | null>(null)
  const [referenceDocuments, setReferenceDocuments] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null)

  const handleMainDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainDocument(e.target.files[0])
    }
  }

  const handleReferenceDocumentsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReferenceDocuments(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (mainDocument) {
      setIsUploading(true)
      try {
        const response = await uploadDocument(mainDocument)
        setUploadedDocId(response.id)
        onUploadSuccess(response.id)
        console.log('Document uploaded:', response)
      } catch (error) {
        console.error('Error uploading document:', error)
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">上传文档</h2>
        <Input type="file" accept=".docx" onChange={handleMainDocumentUpload} />
        {mainDocument && <p className="mt-2">选择: {mainDocument.name}</p>}
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">上传知识库文档</h2>
        <Input type="file" accept=".docx" multiple onChange={handleReferenceDocumentsUpload} />
        {referenceDocuments.length > 0 && (
          <ul className="mt-2">
            {referenceDocuments.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>
      <Button onClick={handleUpload} disabled={!mainDocument || isUploading}>
        {isUploading ? '上传中...' : '已处理文档'}
      </Button>
      {uploadedDocId && (
        <p className="text-green-600">文档上传成功. ID: {uploadedDocId}</p>
      )}
    </div>
  )
}

