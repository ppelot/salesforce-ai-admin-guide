import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
} from 'lucide-react';
import type { Journey } from '../lib/types';
import { useAppState } from '../lib/state';
import { computeJourneyProgress } from '../lib/progress';
import { useRoute } from '../lib/router';
import { useT } from '../lib/i18n';
import { Badge } from './ui/Badge';

export function ProgressPanel({ journey }: { journey: Journey }) {
  const state = useAppState();
  const { navigate } = useRoute();
  const t = useT();
  const summary = computeJourneyProgress(journey, state.progress[journey.id]);
  const remaining = summary.totalSteps - summary.completedSteps;

  return (
    <aside
      className="print-hidden w-full space-y-4 lg:w-72 lg:shrink-0"
      aria-label={t('progress.panelAria')}
    >
      <div className="rounded-card border border-slate-200 bg-white p-4 card-shadow">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          {t('progress.title')}
        </h2>

        <div className="mb-3 flex items-center gap-3">
          <div
            className="relative grid h-14 w-14 place-items-center rounded-full"
            style={{
              background: `conic-gradient(var(--color-brand-500) ${summary.percent * 3.6}deg, var(--color-brand-100) 0deg)`,
            }}
            aria-hidden="true"
          >
            <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-sm font-bold text-brand-700">
              {summary.percent}%
            </div>
          </div>
          <div className="text-sm">
            <p className="flex items-center gap-1.5 text-success">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {t('progress.completed', { n: summary.completedSteps })}
            </p>
            <p className="flex items-center gap-1.5 text-slate-500">
              <CircleDashed className="h-4 w-4" aria-hidden="true" />
              {t('progress.remaining', { n: remaining })}
            </p>
          </div>
        </div>

        {/* Per-section mini list */}
        <ul className="space-y-1.5">
          {summary.perSection.map((s) => {
            const complete = s.total > 0 && s.completed === s.total;
            return (
              <li key={s.sectionId}>
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      kind: 'journey',
                      journeyId: journey.id,
                      sectionId: s.sectionId,
                    })
                  }
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {complete ? (
                      <CheckCircle2
                        className="h-3.5 w-3.5 shrink-0 text-success"
                        aria-hidden="true"
                      />
                    ) : (
                      <CircleDashed
                        className="h-3.5 w-3.5 shrink-0 text-slate-300"
                        aria-hidden="true"
                      />
                    )}
                    <span className="truncate">{s.title}</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {s.completed}/{s.total}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Open warnings */}
      <div className="rounded-card border border-slate-200 bg-white p-4 card-shadow">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-slate-500">
          <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
          {t('progress.openWarnings')}
        </h2>
        {summary.openWarnings.length === 0 ? (
          <p className="text-sm text-slate-400">{t('progress.noWarnings')}</p>
        ) : (
          <ul className="space-y-2">
            {summary.openWarnings.slice(0, 6).map((ref, i) => (
              <li key={`${ref.warning.id}-${i}`}>
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      kind: 'journey',
                      journeyId: journey.id,
                      sectionId: ref.sectionId,
                    })
                  }
                  className="w-full rounded-md border border-amber-100 bg-warning-soft px-2.5 py-1.5 text-left text-xs text-slate-700 hover:border-amber-200"
                >
                  <span className="font-semibold text-warning">
                    {ref.warning.title}
                  </span>
                  <span className="mt-0.5 block truncate text-slate-500">
                    {ref.sectionTitle}
                  </span>
                </button>
              </li>
            ))}
            {summary.openWarnings.length > 6 && (
              <li className="text-xs text-slate-400">
                {t('progress.more', { n: summary.openWarnings.length - 6 })}
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Ready for validation */}
      <div
        className={`rounded-card border p-4 card-shadow ${
          summary.readyForValidation
            ? 'border-green-200 bg-success-soft'
            : 'border-slate-200 bg-white'
        }`}
      >
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          {t('progress.readyQuestion')}
        </h2>
        <div className="mb-3">
          {summary.readyForValidation ? (
            <Badge tone="success" icon={<CheckCircle2 className="h-3 w-3" />}>
              {t('progress.ready')}
            </Badge>
          ) : (
            <Badge tone="neutral">{t('progress.notYet')}</Badge>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate({ kind: 'validate', journeyId: journey.id })}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          {t('progress.openValidation')}
        </button>
      </div>
    </aside>
  );
}
