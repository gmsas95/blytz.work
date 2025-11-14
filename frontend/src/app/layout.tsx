import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Blytz Hire - Hire VAs in 5 Minutes',
  description: 'Pre-vetted Southeast Asian virtual assistants, ready for short-term weekly contracts. Swipe-based hiring — find your VA in minutes, not weeks.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            richColors
            closeButton
          />
        </AuthProvider>
      </body>
    </html>
  )
}