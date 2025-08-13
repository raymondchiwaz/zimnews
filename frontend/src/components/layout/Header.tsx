'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  const links = [
    { href: '/latest', label: 'Latest' },
    { href: '/categories', label: 'Categories' },
    { href: '/sources', label: 'Sources' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/60 bg-white/70 backdrop-blur-xl dark:border-gray-800/60 dark:bg-gray-950/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Zim News</span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map(l => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={`relative text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 hover:text-primary-600 dark:hover:text-primary-400 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
              >
                {l.label}
                {active && <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-primary-500" />}
              </Link>
            );
          })}
          <button
            aria-label="Toggle theme"
            onClick={() => mounted && setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-2 text-xl transition hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {mounted && theme === 'dark' ? '🌞' : '🌙'}
          </button>
        </nav>

        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className="text-lg">{open ? '✕' : '☰'}</span>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex flex-col space-y-4">
            {links.map(l => (
              <Link
                key={l.href}
                onClick={() => setOpen(false)}
                href={l.href}
                className={`text-sm font-medium ${pathname.startsWith(l.href) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setOpen(false); }}
              className="self-start rounded-md bg-primary-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400"
            >
              Toggle Theme
            </button>
          </div>
        </div>
      )}
    </header>
  );
}