'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { AuthLoading } from '@/components/auth/auth-loading';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  status: string;
  summary?: string;
  keywords?: string[];
}

export default function DocumentDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Document not found');
          }
          throw new Error('Failed to fetch document');
        }
        const data = await response.json();
        setDocument(data);
        setEditedTitle(data.title);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchDocument();
    }
  }, [authLoading, params.id]);

  const handleUpdateTitle = async () => {
    try {
      const response = await fetch(`/api/documents/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editedTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      const updatedDoc = await response.json();
      setDocument(updatedDoc);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document');
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
          <Button onClick={() => router.push('/documents')}>
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !document) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/documents">
          <Button variant="outline">← Back to Documents</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="border rounded px-2 py-1"
              />
              <Button onClick={handleUpdateTitle}>Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{document.title}</h1>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </div>
          )}
          <span className={`px-3 py-1 rounded-full text-sm ${
            document.status === 'processed' 
              ? 'bg-green-100 text-green-800'
              : document.status === 'processing'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {document.status}
          </span>
        </div>

        <div className="space-y-6">
          {document.summary && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Summary</h2>
              <p className="text-gray-700">{document.summary}</p>
            </div>
          )}

          {document.keywords && document.keywords.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {document.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-2">Content</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {document.content}
              </pre>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Created on {new Date(document.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
