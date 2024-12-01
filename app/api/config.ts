// Base URL for API requests
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// Helper function to construct full API URL
export const getApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

// Helper function for making API requests
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = getApiUrl(endpoint);
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
}

