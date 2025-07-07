import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Zim News Aggregator',
  description: 'Your comprehensive source for Zimbabwean news across all media outlets',
  keywords: ['Zimbabwe', 'news', 'media', 'politics', 'business', 'sports'],
  authors: [{ name: 'Zim News Team' }],
  openGraph: {
    title: 'Zim News Aggregator',
    description: 'Your comprehensive source for Zimbabwean news across all media outlets',
    type: 'website',
    locale: 'en_US',
    siteName: 'Zim News Aggregator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zim News Aggregator',
    description: 'Your comprehensive source for Zimbabwean news across all media outlets',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
} 