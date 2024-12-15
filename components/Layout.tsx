'use client'

import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Sidebar } from '@/components/Sidebar'
import { useMenu } from '@/app/context/MenuContext'
import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { activeMenu, setActiveMenu } = useMenu();

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <header>
        <h1 className="text-2xl font-bold mb-4">中文文本纠错</h1>
      </header>
      <main className="flex-grow mb-16 flex">
        <Sidebar 
          activeMenu={activeMenu} 
          onMenuSelect={setActiveMenu}
          className="flex-shrink-0"
        />
        <div className="flex-grow pl-4">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
