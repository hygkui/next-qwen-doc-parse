'use client'

import { useState } from 'react'
import AuthenticationModal from './components/AuthenticationModal'
import Layout from './components/Layout'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <AuthenticationModal onAuthenticate={() => setIsAuthenticated(true)} />
  }

  return <Layout />
}

