import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ['latin'] })

// Dynamically import GalaxyBackground with no SSR
const GalaxyBackground = dynamic(() => import('./components/GalaxyBackground'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-black" />
})

export const metadata: Metadata = {
  title: 'AI Code Debugger',
  description: 'An AI-powered code analysis tool that analyzes, debugs, and optimizes code across multiple programming languages.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-black overflow-x-hidden`}>
        <GalaxyBackground />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen">
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30" />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 