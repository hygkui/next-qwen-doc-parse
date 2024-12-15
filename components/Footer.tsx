import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-100 p-4 border-t">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {currentYear} 文档解析系统. 保留所有权利.
        </div>
        <div className="text-sm">
          <Link href="/privacy-policy" className="text-blue-500 hover:text-blue-700">
            隐私政策
          </Link>
        </div>
      </div>
    </footer>
  )
}
