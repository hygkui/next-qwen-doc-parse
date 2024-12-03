import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Document {
  id: string
  name: string
  createdAt: string
}

interface ManualCorrectionModalProps {
  document: Document
  onClose: () => void
}

export default function ManualCorrectionModal({ document, onClose }: ManualCorrectionModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manual Corrections for {document.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p>Here you can display the manual corrections for the document.</p>
          <p>Document ID: {document.id}</p>
          <p>Created At: {document.createdAt}</p>
          {/* Add more details about manual corrections here */}
        </div>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </DialogContent>
    </Dialog>
  )
}

