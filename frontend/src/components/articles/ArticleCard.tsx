import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

export interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  source: string;
  publishedAt: string;
  imageUrl?: string | null;
  category?: string;
  badge?: ReactNode;
}

export function ArticleCard({ id, title, excerpt, source, publishedAt, imageUrl, category, badge }: ArticleCardProps) {
  return (
    <article className="group article-card h-full flex flex-col">
      <Link href={`/articles/${id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl">📰</div>
          )}
          {category && (
            <span className="absolute left-2 top-2 rounded bg-primary-600/90 px-2 py-0.5 text-xs font-medium text-white shadow">{category}</span>
          )}
          {badge && (
            <span className="absolute right-2 top-2">{badge}</span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">{title}</h3>
          <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{excerpt}</p>
          <div className="mt-auto pt-4 text-xs text-gray-500 dark:text-gray-500">
            <span className="font-medium text-gray-700 dark:text-gray-300">{source}</span>
            <span className="mx-2">•</span>
            <time dateTime={publishedAt}>{new Date(publishedAt).toLocaleString()}</time>
          </div>
        </div>
      </Link>
    </article>
  );
}
