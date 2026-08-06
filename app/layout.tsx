import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import SessionTimeoutProvider from '@/components/session-timeout-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alghahim Pay - Payment Link Management',
  description: 'Create and manage custom payment links with USD display and KES checkout via Paystack',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Alghahim Pay',
    description: 'Secure payment links that pay and grow your business',
    images: ['/logo.png'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#001f3f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionTimeoutProvider timeoutMinutes={30} warningMinutes={5}>
          {children}
        </SessionTimeoutProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
