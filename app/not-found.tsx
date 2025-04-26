'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { RocketIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import setGlobalColorTheme from '@/lib/theme-colors';

export default function NotFound() {
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    const selectedColor = 'Blue';
    setGlobalColorTheme(theme === 'dark' ? 'dark' : 'light', selectedColor);
  }, [theme]);

  return (
    <section className="flex items-center justify-center w-full h-screen bg-[var(--background)]">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative mb-8">
            <h1 className="text-8xl md:text-9xl font-extrabold tracking-tight text-[var(--primary)] opacity-20">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <RocketIcon className="w-16 h-16 mx-auto mb-4 text-[var(--destructive)]" />
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                  Page Not Found
                </h2>
              </div>
            </div>
          </div>

          <p className="mb-6 text-lg text-[var(--muted-foreground)] max-w-md mx-auto">
            Oops! The page you're looking for has been lost in space. Don't worry, we'll help you get back home.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="px-6 py-3 border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)]"
            >
              Go Back
            </Button>
            <Button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
            >
              Return Home
            </Button>
          </div>

          <p className="mt-8 text-sm text-[var(--muted-foreground)]">
            Still lost?{' '}
            <a href="/contact" className="text-[var(--primary)] hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}