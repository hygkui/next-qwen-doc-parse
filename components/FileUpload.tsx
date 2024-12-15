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

    const fileType = file.name.toLowerCase();
    if (!fileType.endsWith('.txt') && !fileType.endsWith('.pdf')) {
      setUploadError('仅支持 .txt 和 .pdf 文件');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('文件大小不能超过10MB');
      return;
    }

    setSelectedFile(file)
    setIsUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      
      if (!response.ok || (data.results && data.results[0]?.error)) {
        const errorMessage = data.results?.[0]?.error || '上传失败';
        setUploadError(errorMessage);
        // Show error in the documents page error container
        const errorContainer = document.getElementById('uploadError');
        const errorMessageElement = document.getElementById('errorMessage');
        if (errorContainer && errorMessageElement) {
          errorMessageElement.textContent = errorMessage;
          errorContainer.classList.remove('hidden');
        }
        return;
      }

      // Hide error container if upload was successful
      const errorContainer = document.getElementById('uploadError');
      if (errorContainer) {
        errorContainer.classList.add('hidden');
      }

      if (data.success && data.documentId) {
        onUploadComplete(data.documentId, fileContent || undefined)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : '上传失败')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Input
          type="file"
          accept=".txt, .pdf"
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
