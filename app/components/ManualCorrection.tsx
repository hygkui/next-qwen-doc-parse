import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function ManualCorrection() {
  const [text, setText] = useState('')

  const handleCorrection = () => {
    // Here you would implement the logic to process the corrections
    console.log('Processed corrections:', text)
  }

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Manual Correction</h2>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your corrections here. Use **** to mark corrections."
        className="h-40 mb-2"
      />
      <Button onClick={handleCorrection}>Process Corrections</Button>
    </div>
  )
}

