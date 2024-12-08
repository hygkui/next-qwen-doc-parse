import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ 
  className, 
  message = '加载中...', 
  size = 'md' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-2', 
      className
    )}>
      <div 
        className={cn(
          'animate-spin rounded-full border-4 border-t-blue-500 border-gray-200',
          sizeClasses[size]
        )}
      />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  )
}
