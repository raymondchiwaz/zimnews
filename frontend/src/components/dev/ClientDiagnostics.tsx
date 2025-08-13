'use client';

import { useState, useEffect } from 'react';

export function ClientDiagnostics() {
  const [count, setCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <div className="mt-6 rounded-lg border border-dashed border-primary-300 bg-primary-50/40 p-4 text-xs dark:border-primary-700 dark:bg-primary-950/30">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setCount(c => c + 1)}
          className="rounded-md bg-primary-600 px-2 py-1 font-medium text-white shadow hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        >Increment ({count})</button>
        <span className="font-mono">hydrated: {hydrated ? 'true' : 'false'}</span>
        <span className="font-mono">ts: {Date.now()}</span>
      </div>
    </div>
  );
}
