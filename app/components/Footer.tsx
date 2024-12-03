import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-100 p-4 border-t">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-sm text-gray-600">
          © {currentYear} 中文文本纠错. All rights reserved.
        </div>
        <div className="text-sm">
          <Link href="/privacy-policy" className="text-blue-500 hover:text-blue-700">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}

