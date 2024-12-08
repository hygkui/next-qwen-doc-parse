import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { ErrorModal } from '@/components/ErrorModal'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface FileUploadProps {
  onUploadComplete: (id: string, content?: string) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.txt')) {
      setUploadError('Please upload a .txt file')
      return
    }

    setSelectedFile(file)
    setIsUploading(true)
    setUploadError(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        setFileContent(event.target.result as string)
      }
    }
    reader.readAsText(file)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      if (data.success) {
        onUploadComplete(data.filePath, data.content)
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to upload file'
      setUploadError(errorMessage)
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="flex-1"
        />
        {isUploading && <LoadingSpinner />}
      </div>
      
      {selectedFile && (
        <p className="text-sm text-gray-600">
          Selected file: {selectedFile.name}
        </p>
      )}

      {/* {fileContent && (
        <pre className="text-sm text-gray-600">
          {fileContent}
        </pre>
      )} */}

      {uploadError && (
        <ErrorModal
          isOpen={!!uploadError}
          onClose={() => setUploadError(null)}
          title="Upload Error"
          message={uploadError}
        />
      )}
    </div>
  )
}
