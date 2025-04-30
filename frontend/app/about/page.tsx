'use client';

import { useTheme } from 'next-themes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const { theme } = useTheme(); 

  return (
    <div className="min-h-screen bg-background">    
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">AI Code Debugger</h1>
          </div>
          <nav className="flex items-center space-x-6">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-muted"
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/about" className="hover:text-primary">About</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="p-8 text-center max-w-md">
            <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              We're working on something exciting! Stay tuned for updates about our AI Code Debugger.
            </p>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
} 