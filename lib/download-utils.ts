export async function downloadDocument(documentId: string, type: 'original' | 'corrected' = 'original') {
  try {
    const response = await fetch(`/api/documents/${documentId}/download?type=${type}`, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '下载失败');
    }

    // Get the content type and filename from headers
    const contentType = response.headers.get('Content-Type');
    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition?.match(/filename="(.+?)"/);
    const filename = filenameMatch ? filenameMatch[1] : 'document';

    const blob = await response.blob();

    // Create blob with the correct content type
    const fileBlob = new Blob([blob], { type: contentType || 'application/octet-stream' });

    // Create a download link
    const url = window.URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Document download error:', error);
    alert(error instanceof Error ? error.message : '下载文档时发生错误');
  }
}