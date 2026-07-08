import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  FileText,
  Hash,
  ListChecks,
  Navigation,
  Search as SearchIcon,
  Wrench,
} from 'lucide-react';
import type { SearchHit, SearchRecordType } from '../lib/types';
import { getSearchIndex } from '../data';
import { search as runSearch, highlight } from '../lib/search';
import { useRoute } from '../lib/router';
import { useT, useLanguage, type UIKey } from '../lib/i18n';
import { Badge } from './ui/Badge';

const TYPE_META: Record<
  SearchRecordType,
  { labelKey: UIKey; icon: typeof FileText }
> = {
  step: { labelKey: 'search.type.step', icon: ListChecks },
  section: { labelKey: 'search.type.section', icon: FileText },
  navPath: { labelKey: 'search.type.navPath', icon: Navigation },
  apiName: { labelKey: 'search.type.apiName', icon: Hash },
  prompt: { labelKey: 'search.type.prompt', icon: BookOpen },
  troubleshooting: { labelKey: 'search.type.troubleshooting', icon: Wrench },
};

/** Render a title/breadcrumb string with matched tokens wrapped in <mark>. */
function Highlighted({ text, query }: { text: string; query: string }) {
  const segments = highlight(text, query);
  return (
    <>
      {segments.map((seg, i) =>
        seg.match ? <mark key={i}>{seg.text}</mark> : <span key={i}>{seg.text}</span>,
      )}
    </>
  );
}

export function Search({ q }: { q: string }) {
  const { navigate } = useRoute();
  const t = useT();
  const lang = useLanguage();
  const [query, setQuery] = useState(q);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the box in sync if the route query changes (e.g. from header search).
  useEffect(() => {
    setQuery(q);
  }, [q]);

  // Autofocus the search field on mount for fast keyboard use.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hits: SearchHit[] = useMemo(
    () => runSearch(getSearchIndex(lang), query, 60),
    [query, lang],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ kind: 'search', q: query });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold text-ink">
        <SearchIcon className="h-6 w-6 text-brand-600" aria-hidden="true" />
        {t('search.h1')}
      </h1>

      <form onSubmit={onSubmit} role="search">
        <label htmlFor="search-input" className="sr-only">
          {t('search.inputLabel')}
        </label>
        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="search-input"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-[15px] text-slate-800 placeholder:text-slate-400 focus-visible:border-brand-400 focus-visible:ring-2"
            autoComplete="off"
          />
        </div>
      </form>

      <p className="mt-3 text-sm text-slate-500" aria-live="polite">
        {query.trim() === ''
          ? t('search.empty')
          : t(hits.length === 1 ? 'search.resultsOne' : 'search.resultsMany', {
              n: hits.length,
              q: query.trim(),
            })}
      </p>

      <ul className="mt-4 space-y-2">
        {hits.map((hit) => {
          const meta = TYPE_META[hit.record.type];
          const Icon = meta.icon;
          return (
            <li key={hit.record.id}>
              <button
                type="button"
                onClick={() => navigate(hit.record.route)}
                className="flex w-full items-start gap-3 rounded-card border border-slate-200 bg-white p-4 text-left card-shadow transition-colors hover:border-brand-300"
              >
                <span className="mt-0.5 rounded-lg bg-brand-50 p-1.5 text-brand-600">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{t(meta.labelKey)}</Badge>
                    <span className="truncate text-xs text-slate-400">
                      {hit.record.breadcrumb}
                    </span>
                  </span>
                  <span className="block font-semibold text-ink">
                    <Highlighted text={hit.record.title} query={query} />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {query.trim() !== '' && hits.length === 0 && (
        <div className="mt-6 rounded-card border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">{t('search.noMatches')}</p>
        </div>
      )}
    </div>
  );
}
