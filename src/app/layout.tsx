import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import SecurityHeader from '@/components/SecurityHeader'

export const metadata: Metadata = {
  title: 'Defence Gateway',
  description: 'Joint Forces Island Operation Management Hub',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-container">
            <SecurityHeader />
            <div className="crt-overlay"></div>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
