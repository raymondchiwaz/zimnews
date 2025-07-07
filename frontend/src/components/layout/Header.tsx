'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/75">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Zim News</span>
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link href="/latest" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400">
            Latest
          </Link>
          <Link href="/categories" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400">
            Categories
          </Link>
          <Link href="/sources" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400">
            Sources
          </Link>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
} 