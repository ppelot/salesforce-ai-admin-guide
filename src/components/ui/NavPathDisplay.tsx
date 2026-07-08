import { ChevronRight, Navigation } from 'lucide-react';
import type { NavPath } from '../../lib/types';
import { useT } from '../../lib/i18n';
import { CopyBlock } from '../CopyBlock';

/** Renders a Salesforce Setup breadcrumb, plus a copyable Quick Find term. */
export function NavPathDisplay({ path }: { path: NavPath }) {
  const t = useT();
  return (
    <div className="rounded-lg border border-brand-100 bg-brand-50/60 p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700">
        <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
        {t('navpath.whereToClick')}
      </div>
      <nav aria-label={t('navpath.pathAria')} className="mt-1.5">
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
          {path.segments.map((seg, i) => (
            <li key={i} className="flex items-center gap-1">
              <span className="rounded-md bg-white px-2 py-0.5 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                {seg}
              </span>
              {i < path.segments.length - 1 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-slate-400"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </nav>
      {path.quickFind && (
        <div className="mt-2">
          <CopyBlock
            block={{
              id: 'quickfind',
              label: t('navpath.quickFindTerm'),
              value: path.quickFind,
              kind: 'value',
            }}
          />
        </div>
      )}
    </div>
  );
}
