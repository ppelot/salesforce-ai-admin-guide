import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Home as HomeIcon,
  Printer,
} from 'lucide-react';
import type { GoNoGo, Journey, JourneyId } from '../lib/types';
import { getJourney } from '../data';
import { useAppDispatch, useAppState } from '../lib/state';
import { computeJourneyProgress } from '../lib/progress';
import { useRoute } from '../lib/router';
import { getIcon } from '../lib/icons';
import { useT, useLanguage, type UIKey } from '../lib/i18n';
import { Badge, type BadgeTone } from './ui/Badge';

const GONOGO: Record<GoNoGo, { tone: BadgeTone; labelKey: UIKey }> = {
  go: { tone: 'success', labelKey: 'val.gonogo.go' },
  partial: { tone: 'warning', labelKey: 'val.gonogo.partial' },
  'no-go': { tone: 'neutral', labelKey: 'val.gonogo.noGo' },
};

/** Find the section for a related step id, to deep-link back to it. */
function findSectionForStep(journey: Journey, stepId: string): string | undefined {
  for (const section of journey.sections) {
    if (section.steps.some((s) => s.id === stepId)) return section.id;
  }
  return undefined;
}

export function ValidationDashboard({ journeyId }: { journeyId: JourneyId }) {
  const t = useT();
  const lang = useLanguage();
  const journey = getJourney(journeyId, lang);
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { navigate } = useRoute();
  const prog = state.progress[journeyId];

  const checks = journey.validation;
  const total = checks.length;
  const verified = checks.filter((c) => prog.checks[c.id] === true).length;
  const status: GoNoGo =
    verified === 0 ? 'no-go' : verified === total ? 'go' : 'partial';
  const badge = GONOGO[status];
  const summary = computeJourneyProgress(journey, prog);
  const Icon = getIcon(journey.icon);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={() => navigate({ kind: 'journey', journeyId })}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
      >
        <HomeIcon className="h-4 w-4" aria-hidden="true" />
        {t('val.backTo', { title: journey.title })}
      </button>

      <header className="mb-5 flex items-start gap-3">
        <span className="rounded-xl bg-brand-50 p-2.5 text-brand-600 ring-1 ring-inset ring-brand-100">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
            {t('val.h1')}
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {t('val.subtitle', { title: journey.title })}
          </p>
        </div>
      </header>

      {/* Overall status */}
      <div
        className={`mb-6 rounded-card border p-5 card-shadow ${
          status === 'go'
            ? 'border-green-200 bg-success-soft'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t('val.status')}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge
                tone={badge.tone}
                icon={
                  status === 'go' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : undefined
                }
              >
                {t(badge.labelKey)}
              </Badge>
              <span className="text-sm text-slate-600">
                {t('val.checksVerified', { verified, total })}
              </span>
            </div>
          </div>
          {!summary.readyForValidation && (
            <p className="max-w-xs text-xs text-slate-500">{t('val.tip')}</p>
          )}
        </div>
        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={total === 0 ? 0 : Math.round((verified / total) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('val.completionAria')}
        >
          <div
            className="h-full rounded-full bg-success transition-all"
            style={{ width: `${total === 0 ? 0 : (verified / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Checks */}
      <ol className="space-y-3">
        {checks.map((check, i) => {
          const done = prog.checks[check.id] === true;
          const sectionId = check.relatedStepId
            ? findSectionForStep(journey, check.relatedStepId)
            : undefined;
          return (
            <li
              key={check.id}
              className="checklist-item rounded-card border border-slate-200 bg-white p-4 card-shadow"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={`val-${check.id}`}
                  checked={done}
                  onChange={(e) =>
                    dispatch({
                      type: 'TOGGLE_CHECK',
                      journeyId,
                      checkId: check.id,
                      checked: e.target.checked,
                    })
                  }
                  className="mt-1 h-4.5 w-4.5 shrink-0 rounded border-slate-300 text-brand-600 focus-visible:ring-2"
                />
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`val-${check.id}`}
                    className="cursor-pointer text-base font-semibold text-ink"
                  >
                    <span className="mr-1.5 text-slate-400">{i + 1}.</span>
                    <span className={done ? 'text-slate-400 line-through' : ''}>
                      {check.label}
                    </span>
                  </label>
                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-medium text-slate-500">
                      {t('val.how')}
                    </span>
                    {check.how}
                  </p>
                  {sectionId && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate({ kind: 'journey', journeyId, sectionId })
                      }
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
                    >
                      {t('val.reviewStep')}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
                {done && (
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-success"
                    aria-hidden="true"
                  />
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Success banner */}
      {status === 'go' && (
        <div className="mt-6 rounded-card border border-green-200 bg-success-soft p-5 text-center card-shadow">
          <CheckCircle2
            className="mx-auto h-8 w-8 text-success"
            aria-hidden="true"
          />
          <p className="mt-2 text-lg font-bold text-ink">
            {t('val.allPassed', { title: journey.title })}
          </p>
          <p className="mt-1 text-sm text-slate-600">{t('val.allPassedSub')}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => navigate({ kind: 'journey', journeyId })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700"
        >
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          {t('val.backToSteps')}
        </button>
        <button
          type="button"
          onClick={() => navigate({ kind: 'print', journeyId })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          {t('val.printChecklist')}
        </button>
      </div>
    </div>
  );
}
