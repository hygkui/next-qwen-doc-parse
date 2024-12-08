import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  errorCode?: string
}

export function ErrorModal({ 
  isOpen, 
  onClose, 
  title = '错误', 
  message, 
  errorCode 
}: ErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {message}
            {errorCode && (
              <div className="mt-2 text-sm text-gray-500">
                错误码: {errorCode}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
