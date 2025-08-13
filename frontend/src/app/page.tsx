import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 py-24 text-white">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.4),transparent_60%)]" />
        <div className="container-custom relative z-10 mx-auto max-w-6xl">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Real-time Zimbabwean News. Curated. Unified.
            </h1>
            <p className="mt-6 text-lg text-primary-50 sm:text-xl">
              Track breaking stories, deep dives, business updates, sports highlights & civic discourse from every major Zimbabwean source — all in one intelligent feed.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/latest" className="btn-primary px-6 py-3 text-base font-semibold shadow-md hover:shadow-lg focus-visible:ring-primary-300">
                Browse Latest News
              </Link>
              <Link href="/sources" className="btn-outline border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur hover:bg-white/20">
                Explore Sources
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-primary-100">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Live aggregation active
            </p>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-40 top-1/2 hidden h-[600px] w-[600px] -translate-y-1/2 rounded-full border border-white/10 md:block" />
      </section>

      <section className="py-20">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Zim News Aggregator?</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              We unify fragmented news streams into a single intelligent interface so you never miss important developments.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {FEATURES.map(f => (
              <div key={f.title} className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-700 ring-1 ring-primary-200 transition group-hover:scale-105 dark:bg-primary-900/30 dark:text-primary-300 dark:ring-primary-800">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
                <div className="mt-4 h-1 w-0 rounded-full bg-primary-500 transition-all group-hover:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20 dark:bg-gray-950/50">
        <div className="container-custom">
          <div className="mx-auto max-w-5xl">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl font-bold sm:text-4xl">Multi-source Integrity & Transparency</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Every article is traceable back to its original publisher. We surface provenance, timestamps and cross-source correlations so you can evaluate context and credibility quickly.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-gray-700 dark:text-gray-400">
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-primary-500" /> Elastic-powered full-text search</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-primary-500" /> Real-time ingestion via queues</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-primary-500" /> Source credibility metadata</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-primary-500" /> Fast filtering & category clustering</li>
                </ul>
                <div className="mt-8 flex gap-4">
                  <Link href="/latest" className="btn-primary px-5 py-2.5">Start Reading</Link>
                  <Link href="/categories" className="btn-outline px-5 py-2.5">View Categories</Link>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-700/10" />
                  <div className="p-6">
                    <p className="text-xs font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400">Live Snapshot</p>
                    <div className="mt-4 space-y-4 text-sm">
                      <SkeletonLine w="90%" />
                      <SkeletonLine w="100%" />
                      <SkeletonLine w="85%" />
                      <SkeletonLine w="70%" />
                      <SkeletonLine w="95%" />
                    </div>
                    <div className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
                      Incoming stream placeholder. This will display real aggregated headlines once backend feed integration is wired.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">Stay ahead with intelligent aggregation insights.</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Soon: personalized feeds, sentiment overlays, source influence graphs and civic issue tracking.
            </p>
            <div className="mt-8 inline-flex items-center gap-4 rounded-full bg-primary-600/10 px-6 py-4 ring-1 ring-primary-600/20 dark:bg-primary-500/10">
              <span className="h-2 w-2 animate-ping rounded-full bg-primary-500" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Alpha feature roadmap evolving — feedback welcome.</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SkeletonLine({ w }: { w: string }) {
  return <div className={`h-3 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse`} style={{ width: w }} />;
}

const FEATURES = [
  {
    title: 'Unified Feed',
    desc: 'All major sources normalized and deduplicated for rapid scanning.',
    icon: '📰'
  },
  {
    title: 'Smart Clustering',
    desc: 'Related developments grouped to reduce noise and repetition.',
    icon: '🧠'
  },
  {
    title: 'Source Transparency',
    desc: 'Trace every headline back to origin with reliability context.',
    icon: '🔍'
  },
  {
    title: 'Real-time Pipeline',
    desc: 'Queue-driven ingestion keeps your view seconds from publish.',
    icon: '⚡'
  },
  {
    title: 'Powerful Search',
    desc: 'Elasticsearch-backed full-text & advanced filtering (coming).',
    icon: '🔎'
  },
  {
    title: 'Upcoming Personalization',
    desc: 'Topic follows, relevance tuning & alerting roadmap.',
    icon: '✨'
  }
];
