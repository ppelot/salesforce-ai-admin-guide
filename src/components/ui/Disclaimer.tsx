import { Info } from 'lucide-react';
import { useT } from '../../lib/i18n';

/**
 * Global disclaimer required by the source guide. Rendered on Home, the print
 * view, and the app footer.
 */
export function Disclaimer({ compact = false }: { compact?: boolean }) {
  const t = useT();
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-slate-50 text-slate-600 ${
        compact ? 'px-3 py-2 text-xs' : 'p-4 text-sm'
      }`}
      role="note"
    >
      <p className="flex items-start gap-2">
        <Info
          className={`shrink-0 text-slate-400 ${compact ? 'mt-0.5 h-3.5 w-3.5' : 'mt-0.5 h-4 w-4'}`}
          aria-hidden="true"
        />
        <span>{t('disclaimer.text')}</span>
      </p>
    </div>
  );
}
