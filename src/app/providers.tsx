'use client'

import { Toaster } from 'react-hot-toast'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#161616',
            color: '#f5f5f0',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '13px',
            borderRadius: '2px',
          },
          success: {
            iconTheme: {
              primary: '#c9a84c',
              secondary: '#161616',
            },
          },
          error: {
            iconTheme: {
              primary: '#c0392b',
              secondary: '#161616',
            },
          },
        }}
      />
    </>
  )
}