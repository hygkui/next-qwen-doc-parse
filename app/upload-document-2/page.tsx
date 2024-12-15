'use client';

import { useState, useEffect, useCallback } from 'react';
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

interface TooltipPosition {
  x: number;
  y: number;
}

interface Correction {
  text: string;
  startIndex: number;
  endIndex: number;
}

export default function UploadDocument2Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') ?? null;

  const [file, setFile] = useState<File | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Selection state
  const [selectedText, setSelectedText] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);

  const handleReturnToList = () => {
    router.push('/documents');
  };

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/documents/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }
        const data = await response.json();
        setDocument(data);
        if (data.corrections) {
          const parsedCorrections = Array.isArray(data.corrections) 
            ? data.corrections.map((c: any) => typeof c === 'string' ? { text: c, startIndex: -1, endIndex: -1 } : c)
            : [{ text: data.corrections, startIndex: -1, endIndex: -1 }];
          setCorrections(parsedCorrections);
        }
        setIsEditing(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch document');
      }
    };

    fetchDocument();
  }, [id]);

  // Handle text selection
  const handleTextSelection = useCallback((event: MouseEvent) => {
    if (typeof window === 'undefined') return;
    
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText) {
      const range = selection?.getRangeAt(0);
      if (!range) return;

      const rect = range.getBoundingClientRect();
      
      // Only show tooltip if selection is within the original content div
      const target = event.target as HTMLElement;
      if (target.closest('.original-content')) {
        setSelectedText(selectedText);
        setTooltipPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        });
        setShowTooltip(true);

        // Get the start and end indices of the selection
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(target.closest('.original-content')!);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;

        setSelectionRange({
          start,
          end: start + selectedText.length
        });
      }
    } else {
      setShowTooltip(false);
      setSelectionRange(null);
    }
  }, []);

  // Copy text to correction textarea
  const handleCopyToCorrection = useCallback(() => {
    if (!selectedText || !selectionRange) return;
    
    setCorrections(prev => [...prev, {
      text: selectedText,
      startIndex: selectionRange.start,
      endIndex: selectionRange.end
    }]);
    setShowTooltip(false);
  }, [selectedText, selectionRange]);

  const handleSaveCorrections = async () => {
    if (!document) return;

    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          corrections: corrections.map(c => ({
            text: c.text,
            startIndex: c.startIndex,
            endIndex: c.endIndex
          })),
          status: 'corrected'
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

  // Add text selection event listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.document.addEventListener('mouseup', handleTextSelection);
      return () => {
        window.document.removeEventListener('mouseup', handleTextSelection);
      };
    }
  }, [handleTextSelection]);

  // Function to render original content with highlights
  const renderHighlightedContent = (content: string) => {
    if (!content) return null;

    let lastIndex = 0;
    const elements: JSX.Element[] = [];

    // Sort corrections by startIndex to ensure proper rendering
    const sortedCorrections = [...corrections].sort((a, b) => a.startIndex - b.startIndex);

    sortedCorrections.forEach((correction, index) => {
      if (correction.startIndex >= 0 && correction.endIndex > correction.startIndex) {
        // Add text before the highlight
        if (correction.startIndex > lastIndex) {
          elements.push(
            <span key={`text-${index}`}>
              {content.slice(lastIndex, correction.startIndex)}
            </span>
          );
        }

        // Add highlighted text
        elements.push(
          <span 
            key={`highlight-${index}`}
            className="bg-yellow-100 border-b-2 border-red-500"
          >
            {content.slice(correction.startIndex, correction.endIndex)}
          </span>
        );

        lastIndex = correction.endIndex;
      }
    });

    // Add remaining text
    if (lastIndex < content.length) {
      elements.push(
        <span key="text-end">
          {content.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full p-4 space-y-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleReturnToList}
          >
            返回文档列表
          </Button>
        </div>

        <div className="space-y-4">
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
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">文档上传说明：</h3>
                <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                  <li>支持的文件格式：.txt、.pdf、.doc 和 .docx</li>
                  <li>文件大小限制：10MB以内</li>
                  <li>文档页数限制：100页以内</li>
                </ul>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
                  选择文件
                </label>
                <Input 
                  id="file"
                  type="file" 
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const selectedFile = event.target.files?.[0];
                    if (selectedFile) {
                      setFile(selectedFile);
                      setError(null);
                      setMessage(null);
                    }
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex items-center justify-between">
                <Button
                  onClick={async () => {
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

                      const res = await response.json();

                      if (!response.ok) {
                        throw new Error(res.error || 'Failed to upload document');
                      }

                      const data = res.results[0];
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

                      router.push(`/upload-document-2?id=${data.id}`);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Failed to upload document');
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  disabled={!file || isUploading}
                  className="w-full"
                >
                  {isUploading ? '上传中...' : '上传文档'}
                </Button>
              </div>
            </div>
          )}

          {/* Document Content and Corrections Section */}
          {isEditing && document && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Content */}
              <div>
                <h2 className="text-xl font-semibold mb-4">原始内容</h2>
                <div className="original-content bg-gray-100 p-4 rounded-lg max-h-[600px] overflow-y-auto">
                  <div className="whitespace-pre-wrap">
                    {renderHighlightedContent(document.originalContent || '')}
                  </div>
                </div>
              </div>

              {/* Corrections */}
              <div>
                <h2 className="text-xl font-semibold mb-4">校对内容</h2>
                <div className="space-y-2">
                  {corrections.map((correction, index) => (
                    <div key={index} className="bg-white border p-4 rounded-lg">
                      {correction.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selection Tooltip */}
          {showTooltip && (
            <div
              style={{
                position: 'fixed',
                left: tooltipPosition.x,
                top: tooltipPosition.y,
                transform: 'translate(-50%, -100%)',
                zIndex: 1000
              }}
              className="bg-white shadow-lg rounded p-2"
            >
              <Button onClick={handleCopyToCorrection} size="sm">
                添加到校对区
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
