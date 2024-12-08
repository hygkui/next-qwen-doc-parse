'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from './Footer'

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <header>
        <h1 className="text-2xl font-bold mb-4">中文文本纠错</h1>
      </header>
      <main className="flex-grow mb-16">
        {children}
      </main>
      <Footer />
    </div>
  )
}

