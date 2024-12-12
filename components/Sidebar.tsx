import React from 'react';
import { cn } from "@/lib/utils";

const menuItems = [
  { id: 'home', label: '上传文档', icon: '🏠' },
  { id: 'upload-document-2', label: '上传文档 2.0', icon: '📤' },
  { id: 'documents', label: '文档', icon: '📄' },
  { id: 'knowledge-base', label: '知识库', icon: '🧠' },
  { id: 'conversation-history', label: '会话记录', icon: '💬' },
];

interface SidebarProps {
  className?: string;
  activeMenu?: string;
  onMenuSelect?: (menuId: string) => void;
}

export function Sidebar({ 
  className, 
  activeMenu = 'home', 
  onMenuSelect 
}: SidebarProps) {
  return (
    <div className={cn(
      "w-64 bg-gray-100 h-full p-4 border-r border-gray-200", 
      className
    )}>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li 
              key={item.id}
              className={cn(
                "flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200",
                activeMenu === item.id 
                  ? "bg-blue-100 text-blue-600" 
                  : "hover:bg-gray-200"
              )}
              onClick={() => onMenuSelect?.(item.id)}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
