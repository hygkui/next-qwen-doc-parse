'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from './Footer'

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <header>
        <h1 className="text-2xl font-bold mb-4">中文文本纠错</h1>
        {/* <nav className="mb-4">
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="text-blue-500 hover:text-blue-700">首页</Link>
            </li>
            <li>
              <Link href="/documents" className="text-blue-500 hover:text-blue-700">文档</Link>
            </li> 
            <li>
              <Link href="/knowledge" className="text-blue-500 hover:text-blue-700">知识库</Link>
            </li>
          </ul>
        </nav> */}
      </header>
      <main className="flex-grow mb-16">
        {children}
      </main>
      <Footer />
    </div>
  )
}

