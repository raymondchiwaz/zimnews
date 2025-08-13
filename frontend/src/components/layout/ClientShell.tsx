'use client';

import React from 'react';
import { Providers } from '@/app/providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';

interface ClientShellProps {
  children: React.ReactNode;
}

/**
 * ClientShell encapsulates all interactive client-side layout elements:
 * - Theme + global context providers
 * - Responsive navigation header
 * - Footer with dynamic year
 * - Toaster notifications
 * Additional client personalization / feature flags can be added here later.
 */
export function ClientShell({ children }: ClientShellProps) {
  return (
    <Providers>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main" className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#1f2937', color: '#fff' }
        }}
      />
    </Providers>
  );
}
