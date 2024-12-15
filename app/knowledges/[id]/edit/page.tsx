'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/auth-context';
import { AuthLoading } from '@/components/auth/auth-loading';
import { KnowledgeForm } from '@/components/knowledge/knowledge-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Knowledge {
  id: string;
  title: string;
  content: string;
  type: string;
  tags?: string[];
}

export default function EditKnowledgePage({ params }: { params: { id: string } }) {
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
        <Link href={`/knowledges/${params.id}`}>
          <Button variant="outline">← Back to Knowledge Entry</Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Edit Knowledge Entry</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <KnowledgeForm initialData={knowledge} isEditing />
        </div>
      </div>
    </div>
  );
}
