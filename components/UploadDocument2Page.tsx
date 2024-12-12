import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from './LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './UploadDocument2Page.module.css';

interface TooltipPosition {
  x: number;
  y: number;
}

interface CorrectionDiff {
  original: string;
  corrected: string;
}

export default function UploadDocument2Page() {
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [documentText, setDocumentText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Selection state
  const [selectedText, setSelectedText] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [manualAnalysis, setManualAnalysis] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [correctionDiff, setCorrectionDiff] = useState<CorrectionDiff | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('上传失败');

      const data = await response.json();
      setDocumentId(data.documentId);
      setDocumentText(data.text);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(1);

      // Automatically analyze with Qwen
      if (data.text) {
        analyzeDocument(data.text);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeDocument = async (text: string) => {
    setIsAnalyzing(true);
    setAnalysisResult('');
    setDebugInfo('');
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '分析请求失败');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let debugText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        debugText += chunk;
        setDebugInfo(debugText);

        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('Received event:', data);

              switch (data.type) {
                case 'chunk':
                  // Use rawChunk instead of content to avoid duplicates
                  setAnalysisResult(data.rawChunk || '');
                  break;
                case 'error':
                  throw new Error(data.error);
                case 'end':
                  console.log('Stream ended:', data);
                  break;
                default:
                  console.log('Unknown event type:', data);
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : '分析失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle text selection
  const handleTextSelection = useCallback((event: MouseEvent) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText) {
      // Use mouse position instead of range position
      setSelectedText(selectedText);
      setTooltipPosition({
        x: event.clientX,
        y: event.clientY
      });
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
  }, []);

  // Copy text to correction textarea
  const handleCopyToCorrection = useCallback(() => {
    if (!selectedText) return;
    setAiAnalysis(selectedText);
    setShowTooltip(false);
  }, [selectedText]);

  // Handle AI correction
  const handleAiCorrection = async () => {
    if (!aiAnalysis.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: aiAnalysis,
          type: 'correction'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 处理普通JSON响应
      const result = await response.json();
      if (result.content) {
        setAiAnalysis(result.content);
        // 更新改动对比
        setCorrectionDiff({
          original: aiAnalysis,
          corrected: result.content
        });
      }
    } catch (error) {
      console.error('Error during correction:', error);
      setError(`校对请求失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Reanalyze handler
  const handleAnalyze = () => {
    if (documentText) {
      analyzeDocument(documentText);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Upload and Preview */}
        <div className="space-y-4">
          <div className="flex gap-4 mb-4">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".txt,.doc,.docx,.pdf"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              上传
            </label>
            {documentId && (
              <Button 
                variant="outline" 
                onClick={() => window.open(`/api/download/${documentId}`, '_blank')}
              >
                下载
              </Button>
            )}
          </div>

          <Card className="p-4">
            <h2 className="font-semibold">AI 分析</h2>
              <Button
                size="sm"
                onClick={handleAnalyze}
                disabled={!documentText || isAnalyzing}
              >
                重新分析
              </Button>
              {isAnalyzing ? (
              <div>
                <LoadingSpinner text="正在分析..." />
                <div onMouseUp={handleTextSelection} className={styles.markdownContainer}>
                  <ReactMarkdown className="prose mt-4" remarkPlugins={[remarkGfm]}>
                    {analysisResult}
                  </ReactMarkdown>
                  {showTooltip && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCopyToCorrection();
                      }}
                      className={styles.tooltipButton}
                      style={{
                        position: 'fixed',
                        left: `${tooltipPosition.x}px`,
                        top: `${tooltipPosition.y}px`,
                        transform: 'translateY(-50%)',
                        zIndex: 50,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      校对此段
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div onMouseUp={handleTextSelection} className={styles.markdownContainer}>
                <ReactMarkdown className="prose mt-4" remarkPlugins={[remarkGfm]}>
                  {analysisResult}
                </ReactMarkdown>
                {showTooltip && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCopyToCorrection();
                    }}
                    className={styles.tooltipButton}
                    style={{
                      position: 'fixed',
                      left: `${tooltipPosition.x}px`,
                      top: `${tooltipPosition.y}px`,
                      transform: 'translateY(-50%)',
                      zIndex: 50,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    校对此段
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* AI and Manual Analysis */}
        <div className="space-y-4">
          <Card className="p-4">
            {/* AI Analysis Section */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={handleCopyToCorrection}
                  disabled={!selectedText}
                  className="w-24"
                >
                  <span>校对此段</span>
                </Button>
                <Button
                  onClick={handleAiCorrection}
                  disabled={!aiAnalysis.trim() || isLoading}
                  className="w-24"
                >
                  {isLoading ? <LoadingSpinner /> : <span>AI校对</span>}
                </Button>
              </div>

              <Textarea
                value={aiAnalysis}
                onChange={(e) => setAiAnalysis(e.target.value)}
                placeholder="待校对文本..."
                className="h-40"
              />

              {/* 改动对比显示 */}
              {correctionDiff && (
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-2">改动对比</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">原文：</span>
                      <p className="text-red-500">{correctionDiff.original}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">修改后：</span>
                      <p className="text-green-500">{correctionDiff.corrected}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {error && (
              <div className="mt-2 p-2 bg-red-50 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
          </Card>

          <Card className="p-4 mt-4">
            <h2 className="text-lg font-semibold mb-2">人工校对</h2>
            <Textarea
              value={manualAnalysis}
              onChange={(e) => setManualAnalysis(e.target.value)}
              placeholder="在这里输入人工校对内容..."
              className="h-32 resize-none"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
