'use client'

import { Toaster } from 'react-hot-toast'
import AppBootSplash from '@/components/brand/AppBootSplash'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppBootSplash />
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1A2238',
            border: '1px solid #e8e4de',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '13px',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: { primary: '#D62828', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#D62828', secondary: '#ffffff' },
          },
        }}
      />
    </>
  )
}
