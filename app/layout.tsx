import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import SessionTimeoutProvider from '@/components/session-timeout-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Committee - Payment Link Management',
  description: 'Create and manage custom payment links with USD display and KES checkout via Paystack',
  icons: {
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AI4NpeWalkY7W71u1pkZBkccI4LRDE.png',
    apple: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AI4NpeWalkY7W71u1pkZBkccI4LRDE.png',
  },
  openGraph: {
    title: 'Committee',
    description: 'Secure payment links that pay and grow your business',
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AI4NpeWalkY7W71u1pkZBkccI4LRDE.png'],
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
