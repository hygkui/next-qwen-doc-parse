'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/auth-context';
import { AuthLoading } from '@/components/auth/auth-loading';
import { Button } from '@/components/ui/button';
import { downloadDocument } from '@/lib/download-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFileSize, formatDate } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  fileType: string;
  fileSize: number;
  totalPages: number;
  status: string;
  createdAt: string;
}

export default function DocumentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      fetchDocuments();
    }
  }, [authLoading]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('获取文档列表失败');
      }
      const { documents: docs } = await response.json();
      setDocuments(docs);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生错误');
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`确定要删除文档 "${title}" 吗？此操作不可恢复。`)) {
      return;
    }

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除文档失败');
      }

      // Remove the document from the list
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除文档时发生错误');
    } finally {
      setIsDeleting(null);
    }
  };

  if (authLoading) {
    return <AuthLoading />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        错误: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">文档列表</h1>
          <Link href="/upload-document-2">
            <Button>上传新文档</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文档</h3>
            <p className="text-gray-500 mb-4">上传您的第一个文档开始使用</p>
            <Link href="/upload-document-2">
              <Button>上传文档</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">文档信息</TableHead>
                  <TableHead className="w-1/6">类型</TableHead>
                  <TableHead className="w-1/6">大小</TableHead>
                  <TableHead className="w-1/6">页数</TableHead>
                  <TableHead className="w-1/6">状态</TableHead>
                  <TableHead className="w-1/4">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{doc.title}</div>
                        <div className="text-sm text-gray-500">
                          创建时间: {formatDate(doc.createdAt)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{doc.fileType}</TableCell>
                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell>{doc.totalPages} 页</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doc.status === 'corrected' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doc.status === 'corrected' ? '已校对' : '未校对'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/upload-document-2?id=${doc.id}`}>
                          <Button variant="outline" size="sm">
                            校对
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => downloadDocument(doc.id, 'original')}
                        >
                          下载原文
                        </Button>
                        {doc.status === 'corrected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadDocument(doc.id, 'corrected')}
                          >
                            下载校对版
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(doc.id, doc.title)}
                          disabled={isDeleting === doc.id}
                        >
                          {isDeleting === doc.id ? '删除中...' : '删除'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
