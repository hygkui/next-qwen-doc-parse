'use client';

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth-context';
import { AuthLoading } from '@/components/auth/auth-loading';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Knowledge {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  type: string;
}

export default function KnowledgesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [knowledges, setKnowledges] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      fetchKnowledges();
    }
  }, [authLoading]);

  const fetchKnowledges = async () => {
    try {
      const response = await fetch('/api/knowledges')
      if (!response.ok) {
        throw new Error('获取知识库列表失败')
      }
      const data = await response.json()
      console.log('Fetched data:', data) // Debug log
      setKnowledges(data.documents || [])
    } catch (error) {
      console.error('Error fetching knowledges:', error)
      alert('获取知识库列表失败')
    } finally {
      setLoading(false)
    }
  };

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/knowledges/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传文档失败');
      }

      alert('文档上传成功');

      // Refresh the list
      fetchKnowledges();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('上传文档失败');
    } finally {
      setUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条知识条目吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/knowledges/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除知识条目失败');
      }

      setKnowledges(knowledges.filter(k => k.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除知识条目失败');
    }
  };

  if (authLoading) {
    return <AuthLoading />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>重试</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.isDefaultUser ? '访客知识库' : '我的知识库'}
        </h1>
        <div className="relative">
          <input
            type="file"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".txt,.doc,.docx,.pdf"
            disabled={uploading}
          />
          <Button disabled={uploading}>
            {uploading ? '上传中...' : '上传新文档'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>加载中...</p>
        </div>
      ) : knowledges.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无知识条目</h3>
          <p className="text-gray-500 mb-4">上传您的第一个文档以开始使用</p>
          <div className="relative">
            <input
              type="file"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".txt,.doc,.docx,.pdf"
              disabled={uploading}
            />
            <Button disabled={uploading}>
              {uploading ? '上传中...' : '上传新文档'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>最后更新</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {knowledges && knowledges.map((knowledge) => (
                <TableRow key={knowledge.id}>
                  <TableCell className="font-medium">{knowledge.title}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {knowledge.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(knowledge.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/knowledges/${knowledge.id}`}>
                        <Button variant="outline" size="sm">查看</Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(knowledge.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        删除
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
  );
}
