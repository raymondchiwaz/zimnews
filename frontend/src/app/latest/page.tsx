import { ArticleCard, ArticleCardProps } from '@/components/articles/ArticleCard';
import { ArticleSkeleton } from '@/components/articles/ArticleSkeleton';
import { ClientDiagnostics } from '@/components/dev/ClientDiagnostics';
import LatestClient from './latest.client';

// Define the Article shape returned from fetchArticles
interface Article extends Omit<ArticleCardProps, 'badge'> {}

async function fetchArticles(): Promise<Article[]> {
  try {
    // Call API (rewrite or direct). Relative path works in Next server components.
    const res = await fetch('http://article-service:8002/articles', { cache: 'no-store' });
    if (!res.ok) throw new Error('Bad response');
    const data = await res.json();
    if (Array.isArray(data)) return data as Article[]; // legacy array
    if (data && Array.isArray(data.items)) return data.items as Article[]; // paginated shape
  } catch (e) {
    // fallback demo data
    return Array.from({ length: 9 }).map((_, i) => ({
      id: `demo-${i + 1}`,
      title: `Sample Headline ${i + 1}: Economic developments and policy outlook`,
      excerpt: 'Concise placeholder excerpt summarizing the article content for preview purposes and layout balance.',
      source: i % 2 ? 'The Herald' : 'NewsDay',
      publishedAt: new Date(Date.now() - i * 3600_000).toISOString(),
      imageUrl: null,
      category: ['Politics', 'Business', 'Sports'][i % 3]
    }));
  }
  return [];
}

export default async function LatestPage() {
  const initialArticles = await fetchArticles();
  return (
    <div className="container-custom py-10">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Latest Headlines</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Streaming aggregated updates across Zimbabwean sources.</p>
        </div>
        <SearchAndFilters />
      </header>
      <LatestClient initialArticles={initialArticles} />
      <ClientDiagnostics />
    </div>
  );
}

function SearchAndFilters() {
  return (
    <form className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative">
        <input
          type="search"
          aria-label="Search articles"
          placeholder="Search articles..."
          className="w-72 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-gray-700 dark:bg-gray-900"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {['All','Politics','Business','Sports'].map(tag => (
          <button
            key={tag}
            type="button"
            className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-primary-400 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-primary-500 dark:hover:bg-gray-800"
          >{tag}</button>
        ))}
      </div>
    </form>
  );
}
