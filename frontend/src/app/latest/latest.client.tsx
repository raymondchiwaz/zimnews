'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { ArticleCard, ArticleCardProps } from '@/components/articles/ArticleCard';
import { ArticleSkeleton } from '@/components/articles/ArticleSkeleton';

interface Article extends Omit<ArticleCardProps, 'badge'> {}

function buildFallback(): Article[] {
  return Array.from({ length: 9 }).map((_, i) => ({
    id: `demo-${i + 1}`,
    title: `Sample Headline ${i + 1}: Economic developments and policy outlook`,
    excerpt: 'Client refreshed placeholder excerpt for progressive enhancement.',
    source: i % 2 ? 'The Herald' : 'NewsDay',
    publishedAt: new Date(Date.now() - i * 3600_000).toISOString(),
    imageUrl: null,
    category: ['Politics', 'Business', 'Sports'][i % 3]
  }));
}

async function fetchArticlesClient(): Promise<Article[]> {
  const res = await fetch('/api/articles').catch(() => null);
  if (!res || !res.ok) return buildFallback();
  const data = await res.json();
  if (Array.isArray(data)) return data as Article[]; // legacy plain array
  if (data && Array.isArray(data.items)) return data.items as Article[]; // new paginated shape
  return buildFallback();
}

export default function LatestClient({ initialArticles }: { initialArticles: Article[] }) {
  const [filter, setFilter] = useState<string>('All');
  const query = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticlesClient,
    initialData: initialArticles,
    refetchInterval: 60_000,
  });

  const filtered = useMemo(() => {
    if (!Array.isArray(query.data)) return [] as Article[]; // safeguard
    if (filter === 'All') return query.data;
    return query.data.filter(a => a.category === filter);
  }, [query.data, filter]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {['All','Politics','Business','Sports'].map(tag => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-500/40 dark:focus:ring-primary-400/40 ${filter===tag ? 'border-primary-500 bg-primary-600 text-white dark:border-primary-400 dark:bg-primary-500' : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-primary-500'}`}
          >{tag}</button>
        ))}
      </div>
      {query.isFetching && (
        <div className="mb-4 text-xs text-gray-500 dark:text-gray-400">Refreshing…</div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(a => (
          <ArticleCard key={a.id} {...a} />
        ))}
        {query.isFetching && filtered.length === 0 &&
          Array.from({ length: 9 }).map((_, i) => <ArticleSkeleton key={i} />)}
      </div>
    </div>
  );
}
