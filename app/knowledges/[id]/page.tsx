'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { AuthLoading } from '@/components/auth/auth-loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { X } from 'lucide-react';

interface Knowledge {
  id: string;
  title: string;
  content: string;
  type: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function KnowledgeDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editedTags, setEditedTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const response = await fetch(`/api/knowledges/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('知识库条目未找到');
          }
          throw new Error('获取知识库条目失败');
        }
        const data = await response.json();
        setKnowledge(data);
        setEditedTags(data.tags || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '发生错误');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchKnowledge();
    }
  }, [authLoading, params.id]);

  const handleUpdateTags = async () => {
    try {
      const response = await fetch(`/api/knowledges/${params.id}/tags`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: editedTags }),
      });

      if (!response.ok) {
        throw new Error('更新标签失败');
      }

      const updatedKnowledge = await response.json();
      setKnowledge(updatedKnowledge);
      setIsEditingTags(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新标签失败');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
  };

  if (authLoading) {
    return <AuthLoading />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push('/knowledges')}>
            返回知识库
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !knowledge) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/knowledges">
          <Button variant="outline">← 返回知识库</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{knowledge.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>类型: {knowledge.type}</span>
            <span>•</span>
            <span>更新时间: {new Date(knowledge.updatedAt).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">标签</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingTags(!isEditingTags)}
            >
              {isEditingTags ? '完成' : '编辑标签'}
            </Button>
          </div>
          
          {isEditingTags ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {editedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-600"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="输入新标签"
                  className="max-w-xs"
                />
                <Button onClick={addTag} size="sm">添加</Button>
                <Button onClick={handleUpdateTags} size="sm" variant="default">保存更改</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {knowledge.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">内容</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm break-words font-mono">
              {knowledge.content}
            </pre>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t text-sm text-gray-500">
          创建时间: {new Date(knowledge.createdAt).toLocaleDateString('zh-CN')}
        </div>
      </div>
    </div>
  );
}
