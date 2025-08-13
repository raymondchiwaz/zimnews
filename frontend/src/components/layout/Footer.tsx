'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';

export function Footer() {
  const { theme, setTheme } = useTheme();

  return (
    <footer className="relative w-full border-t border-gray-200 bg-gradient-to-b from-white to-gray-50/80 py-12 dark:border-gray-800 dark:from-gray-950 dark:to-gray-900/40">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_30%_20%,#0ea5e9,transparent_60%)]" />
      <div className="relative container mx-auto px-4">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">Zim News</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Aggregating and contextualizing Zimbabwe&apos;s news ecosystem for clarity and informed discourse.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-200">Product</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/latest" className="text-gray-600 transition hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Latest</Link></li>
              <li><Link href="/categories" className="text-gray-600 transition hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Categories</Link></li>
              <li><Link href="/sources" className="text-gray-600 transition hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Sources</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-200">Company</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-600 transition hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">About</Link></li>
              <li><Link href="/contact" className="text-gray-600 transition hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Contact</Link></li>
              <li><Link href="/privacy" className="text-gray-600 transition hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">Privacy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-200">Connect</h3>
            <div className="mt-3 flex flex-wrap gap-3">
              {['Twitter','Facebook','LinkedIn'].map(s => (
                <a key={s} href="#" className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-primary-600 hover:text-white dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-primary-500">
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400 md:flex-row">
          <p>© {new Date().getFullYear()} Zim News Aggregator. All rights reserved.</p>
          <p className="text-xs">Made with contextual aggregation & open data principles.</p>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:border-primary-500 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-primary-400"
            aria-label="Toggle theme"
          >Theme: {theme === 'dark' ? '🌙 dark' : '🌞 light'}</button>
        </div>
      </div>
    </footer>
  );
}