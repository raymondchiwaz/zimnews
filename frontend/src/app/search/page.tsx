"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = useMemo(() => (searchParams.get('q') || '').trim(), [searchParams]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!q) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/search?q=${encodeURIComponent(q)}`);
        const data = res.ok ? await res.json() : [];
        if (!cancelled) setResults(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [q]);

  return (
    <div className="container-custom py-10">
      <form className="mb-8 flex flex-wrap gap-3" action="/search" method="get">
        <input name="q" defaultValue={q} placeholder="Search headlines..." className="w-72 rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
        <button className="btn-primary px-4 py-2 text-sm" type="submit">Search</button>
      </form>
      {q && (
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{loading ? 'Searching…' : `${results.length} result(s) for `}<span className="font-medium">{q}</span></p>
      )}
      <div className="space-y-4">
        {results.map((r: any) => (
          <div key={r.id} className="rounded border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <Link href={`/articles/${r.id}`} className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">{r.title}</Link>
            <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{r.excerpt}</p>
            <div className="mt-2 text-xs text-gray-500">{r.source} • {new Date(r.publishedAt).toLocaleString()}</div>
          </div>
        ))}
        {q && !loading && results.length === 0 && (
          <div className="rounded border border-dashed p-8 text-center text-sm text-gray-500 dark:text-gray-400">No results yet. Try a different keyword.</div>
        )}
      </div>
    </div>
  );
}
