'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { AuthLoading } from '@/components/auth/auth-loading';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

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

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const response = await fetch(`/api/knowledges/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Knowledge entry not found');
          }
          throw new Error('Failed to fetch knowledge entry');
        }
        const data = await response.json();
        setKnowledge(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchKnowledge();
    }
  }, [authLoading, params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this knowledge entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/knowledges/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete knowledge entry');
      }

      router.push('/knowledges');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete knowledge entry');
    }
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
            Back to Knowledge Base
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
          <Button variant="outline">← Back to Knowledge Base</Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{knowledge.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Type: {knowledge.type}</span>
              <span>•</span>
              <span>Updated: {new Date(knowledge.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/knowledges/${knowledge.id}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </div>

        {knowledge.tags && knowledge.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {knowledge.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="prose max-w-none">
          <ReactMarkdown>{knowledge.content}</ReactMarkdown>
        </div>

        <div className="mt-8 pt-4 border-t text-sm text-gray-500">
          Created on {new Date(knowledge.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
