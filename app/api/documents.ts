// import { fetchApi } from './config';

export interface UploadResponse {
  id: string;
  filename: string;
  url: string;
}

export interface DocumentContent {
  id: string;
  content: string;
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  // In a real implementation, you would use fetchApi here
  // For now, we'll return a mock response
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  return {
    id: 'mock-doc-id',
    filename: file.name,
    url: 'https://example.com/mock-doc-url',
  };
}

export async function getDocumentContent(id: string): Promise<DocumentContent> {
  // In a real implementation, you would use fetchApi here
  // For now, we'll return a mock response
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  return {
    id,
    content: `This is the mock content for document with ID: ${id}. 
    In a real implementation, this would be the actual document content.`,
  };
}

