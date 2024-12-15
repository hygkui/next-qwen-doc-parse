'use client';

import { useEffect, useState } from 'react';
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
  const [knowledges, setKnowledges] = useState<Knowledge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKnowledges = async () => {
      try {
        const response = await fetch('/api/knowledges');
        if (!response.ok) {
          throw new Error('Failed to fetch knowledge entries');
        }
        const data = await response.json();
        setKnowledges(data.knowledges || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchKnowledges();
    }
  }, [authLoading]);

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
        <h1 className="text-2xl font-bold">
          {user?.isDefaultUser ? '访客知识库' : '我的知识库'}
        </h1>
        <Link href="/knowledges/new">
          <Button>创建新条目</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : knowledges.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无知识条目</h3>
          <p className="text-gray-500 mb-4">创建您的第一条知识条目以开始使用</p>
          <Link href="/knowledges/new">
            <Button>创建条目</Button>
          </Link>
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
                      <Link href={`/knowledges/${knowledge.id}/edit`}>
                        <Button variant="outline" size="sm">编辑</Button>
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
