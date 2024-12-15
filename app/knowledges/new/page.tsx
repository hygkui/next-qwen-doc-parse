'use client';

import { KnowledgeForm } from '@/components/knowledge/knowledge-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewKnowledgePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/knowledges">
          <Button variant="outline">← Back to Knowledge Base</Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Create New Knowledge Entry</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <KnowledgeForm />
        </div>
      </div>
    </div>
  );
}
