import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientShell } from '@/components/layout/ClientShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Zim News Aggregator',
  description: 'Your comprehensive source for Zimbabwean news across all media outlets',
  keywords: ['Zimbabwe', 'news', 'media', 'politics', 'business', 'sports'],
  authors: [{ name: 'Zim News Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Zim News Aggregator',
    description: 'Your comprehensive source for Zimbabwean news across all media outlets',
    type: 'website',
    locale: 'en_US',
    siteName: 'Zim News Aggregator',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Zim News Aggregator' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zim News Aggregator',
    description: 'Your comprehensive source for Zimbabwean news across all media outlets',
    images: ['/og-image.svg']
  },
  icons: {
    icon: ['/favicon.svg'],
    apple: ['/icon.svg'],
    shortcut: ['/favicon.svg']
  },
  manifest: '/site.webmanifest',
  other: {
    'color-scheme': 'light dark'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0ea5e9'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-950`}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}