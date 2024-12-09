import React, { useState, useEffect } from 'react';
import { diffChars } from 'diff';

interface CharChange {
  position: number;
  oldValue?: string;
  newValue?: string;
  comment?: string;
}

interface Change {
  type: 'add' | 'delete' | 'modify';
  index: number;
  oldText: string;
  newText: string;
  charChanges?: CharChange[];
}

interface CorrectDocumentProps {
  content: string;
  linesPerPage?: number;
  onContentChange?: (content: string) => void;
}

export const CorrectDocument: React.FC<CorrectDocumentProps> = ({
  content,
  linesPerPage = 30,
  onContentChange,
}) => {
  const [paginatedContent, setPaginatedContent] = useState<string[][]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [editedContent, setEditedContent] = useState<string[]>([])
  const [changes, setChanges] = useState<Change[]>([])
  const [editingComment, setEditingComment] = useState<{
    lineIndex: number;
    charChangeIndex: number;
  } | null>(null);

  useEffect(() => {
    // Split content into lines and then into pages
    const lines = content.split('\n');
    const pages = [];
    
    for (let i = 0; i < lines.length; i += linesPerPage) {
      pages.push(lines.slice(i, i + linesPerPage));
    }

    setPaginatedContent(pages);
    setEditedContent(lines);
  }, [content, linesPerPage]);

  const handleLineChange = (pageIndex: number, lineIndex: number, newText: string) => {
    const globalLineIndex = (currentPage - 1) * linesPerPage + lineIndex;
    const originalText = paginatedContent[pageIndex][lineIndex];

    // Perform character-level diff
    const charDiff = diffChars(originalText, newText);
    
    // Track character-level changes
    const charChanges: CharChange[] = [];
    let currentPosition = 0;
    let currentChange: CharChange | null = null;

    charDiff.forEach(part => {
      if (part.added || part.removed) {
        // If there's an existing change at the same position, merge them
        if (currentChange && currentChange.position === currentPosition) {
          if (part.added) {
            currentChange.newValue = (currentChange.newValue || '') + part.value;
          } else {
            currentChange.oldValue = (currentChange.oldValue || '') + part.value;
          }
        } else {
          // Start a new change
          if (currentChange) {
            charChanges.push(currentChange);
          }
          currentChange = {
            position: currentPosition,
            ...(part.added ? { newValue: part.value } : { oldValue: part.value })
          };
        }
      }
      
      if (!part.removed) {
        currentPosition += part.value.length;
      }
    });

    // Add the last change if exists
    if (currentChange) {
      charChanges.push(currentChange);
    }

    // Track changes
    const newChanges = [...changes];
    const existingChangeIndex = newChanges.findIndex(
      change => change.index === globalLineIndex
    );

    if (existingChangeIndex !== -1) {
      // Update existing change
      newChanges[existingChangeIndex] = {
        type: newText !== originalText ? 'modify' : 'delete',
        index: globalLineIndex,
        oldText: originalText,
        newText: newText,
        charChanges: charChanges
      };
    } else if (newText !== originalText) {
      // Add new change
      newChanges.push({
        type: newText !== '' ? 'add' : 'delete',
        index: globalLineIndex,
        oldText: originalText,
        newText: newText,
        charChanges: charChanges
      });
    }

    // Update edited content
    const newEditedContent = [...editedContent];
    newEditedContent[globalLineIndex] = newText;

    setEditedContent(newEditedContent);
    setChanges(newChanges.filter(change => 
      change.type !== 'modify' || change.oldText !== change.newText
    ));

    // Optional callback for parent component
    if (onContentChange) {
      onContentChange(newEditedContent.join('\n'));
    }
  };

  const handleAddComment = (lineIndex: number, charChangeIndex: number, comment: string) => {
    const newChanges = [...changes];
    const changeIndex = newChanges.findIndex(change => change.index === lineIndex);
    
    if (changeIndex !== -1 && newChanges[changeIndex].charChanges) {
      newChanges[changeIndex].charChanges![charChangeIndex].comment = comment;
      setChanges(newChanges);
      setEditingComment(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginatedContent.length) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left Column: Editable Content */}
      <div className="border rounded-lg p-4">
        <h3 className="text-xl font-semibold mb-4">预览文章</h3>
        <div className="document-content">
          {paginatedContent[currentPage - 1]?.map((line, index) => {
            const globalLineIndex = (currentPage - 1) * linesPerPage + index;
            const isChanged = changes.some(change => change.index === globalLineIndex);
            
            return (
              <div 
                key={index} 
                className={`flex items-center mb-2 ${isChanged ? 'bg-red-50' : ''}`}
              >
                <span className="w-12 text-right mr-4 text-gray-500 font-mono">
                  {globalLineIndex + 1}
                </span>
                <input
                  type="text"
                  value={editedContent[globalLineIndex] || line}
                  onChange={(e) => handleLineChange(currentPage - 1, index, e.target.value)}
                  className="flex-1 border rounded px-2 py-1"
                />
              </div>
            );
          })}
        </div>
        
        {/* Pagination Controls */}
        <div className="pagination-controls flex justify-center items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded mr-2 disabled:opacity-50"
          >
            上一页
          </button>
          <span>
            {currentPage} / {paginatedContent.length}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === paginatedContent.length}
            className="px-4 py-2 border rounded ml-2 disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>

      {/* Right Column: Changes Tracking */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">变动记录 (第 {currentPage} 页)</h3>
        {(() => {
          // Filter changes for the current page
          const pageChanges = changes.filter(change => {
            const pageOfChange = Math.floor(change.index / linesPerPage) + 1;
            return pageOfChange === currentPage;
          });

          return pageChanges.length === 0 ? (
            <p className="text-gray-500">本页暂无变动</p>
          ) : (
            <div className="space-y-2">
              {pageChanges.sort((a, b) => a.index - b.index).map((change, changeIndex) => (
                <div 
                  key={changeIndex} 
                  className={`p-2 rounded ${
                    change.type === 'add' ? 'bg-green-50' : 
                    change.type === 'delete' ? 'bg-red-50' : 'bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <div className="flex-shrink-0 mr-4 font-medium">
                      行号: {(change.index % linesPerPage) + 1}
                    </div>
                    <div className="flex-grow">
                      <span className="text-red-600 mr-2 line-through">原文: {change.oldText}</span>
                      <span className="text-green-600 ml-2">修改: {change.newText}</span>
                    </div>
                  </div>
                  {change.charChanges?.map((charChange, charIndex) => (
                    <div 
                      key={charIndex} 
                      className="mb-2 pl-4 border-l-4 border-blue-200"
                    >
                      <div className="flex items-center">
                        <span className="mr-2 text-red-600">
                          {charChange.oldValue ? `删除: ${charChange.oldValue}` : ''}
                        </span>
                        <span className="mr-2 text-green-600">
                          {charChange.newValue ? `新增: ${charChange.newValue}` : ''}
                        </span>
                        <span className="text-gray-500 ml-2">位置: {charChange.position}</span>
                        <button
                          onClick={() => setEditingComment({
                            lineIndex: change.index,
                            charChangeIndex: charIndex
                          })}
                          className="ml-2 text-blue-500 hover:underline"
                        >
                          {charChange.comment ? '编辑备注' : '添加备注'}
                        </button>
                      </div>
                      {charChange.comment && (
                        <div className="text-sm text-gray-700 mt-1">
                          备注: {charChange.comment}
                        </div>
                      )}
                    </div>
                  ))}
                  {editingComment?.lineIndex === change.index && (
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="输入修改备注"
                        className="w-full border rounded px-2 py-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && editingComment) {
                            handleAddComment(
                              editingComment.lineIndex, 
                              editingComment.charChangeIndex, 
                              (e.target as HTMLInputElement).value
                            );
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default CorrectDocument;
