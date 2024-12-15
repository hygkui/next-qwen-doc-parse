'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface Document {
  id: string;
  title: string;
  parsedContent: string;
  originalContent?: string;
  status: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  totalPages: number;
  preview: string;
  uploadedAt: string;
  corrections?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export default function UploadDocument2Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get('documentId');

  const [file, setFile] = useState<File | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [corrections, setCorrections] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;

      try {
        const response = await fetch(`/api/documents/${documentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }
        const data = await response.json();
        setDocument(data);
        // If document exists, set to editing mode
        setIsEditing(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch document');
      }
    };

    fetchDocument();
  }, [documentId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }

      // Directly set the document state with the uploaded file details
      setDocument({
        id: data.id,
        title: data.title,
        parsedContent: data.parsedContent,
        originalContent: data.originalContent,
        status: data.status,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        totalPages: data.totalPages,
        preview: data.preview,
        uploadedAt: data.uploadedAt
      });

      // Navigate to the document page
      router.push(`/documents/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveCorrections = async () => {
    if (!document) return;

    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          corrections,
          status: 'processed'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save corrections');
      }

      setMessage('Corrections saved successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save corrections');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {isEditing ? '文档校对' : '上传文档'}
        </h1>
        {isEditing && (
          <Button onClick={handleSaveCorrections} variant="default">
            保存校对结果
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {message}
        </div>
      )}

      {/* Document Upload Section */}
      {!isEditing && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
              选择文件
            </label>
            <Input 
              id="file"
              type="file" 
              onChange={handleFileChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
            >
              {isUploading ? '上传中...' : '上传'}
            </Button>
          </div>
        </div>
      )}

      {/* Document Correction Section */}
      {isEditing && document && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">原始内容</h2>
            <div className="bg-gray-100 p-4 rounded-lg max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap">{document.originalContent}</pre>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">校对内容</h2>
            <textarea 
              className="w-full h-[600px] p-4 border rounded-lg"
              value={corrections.join('\n')}
              onChange={(e) => setCorrections(e.target.value.split('\n'))}
              placeholder="在此处进行文档校对..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
