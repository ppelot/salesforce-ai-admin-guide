import { CheckCircle2, Circle, HelpCircle, Target } from 'lucide-react';
import type { JourneyId, Step } from '../lib/types';
import { useAppDispatch, useAppState } from '../lib/state';
import { useT, type UIKey } from '../lib/i18n';
import { Badge, type BadgeTone } from './ui/Badge';
import { Callout } from './ui/Callout';
import { CopyBlock } from './CopyBlock';
import { ExpandableSection } from './ui/ExpandableSection';
import { NavPathDisplay } from './ui/NavPathDisplay';

const GATING_BADGE: Record<Step['gating'], { tone: BadgeTone; labelKey: UIKey }> = {
  required: { tone: 'danger', labelKey: 'gating.required' },
  recommended: { tone: 'info', labelKey: 'gating.recommended' },
  optional: { tone: 'neutral', labelKey: 'gating.optional' },
};

export function StepCard({
  step,
  journeyId,
  compact = false,
}: {
  step: Step;
  journeyId: JourneyId;
  compact?: boolean;
}) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();

  const done = state.progress[journeyId].steps[step.id] === true;
  const note = state.progress[journeyId].notes[step.id] ?? '';
  const gating = GATING_BADGE[step.gating];

  const toggleDone = () =>
    dispatch({
      type: 'SET_STEP_DONE',
      journeyId,
      stepId: step.id,
      done: !done,
    });

  const completionToggle = (
    <button
      type="button"
      onClick={toggleDone}
      aria-pressed={done}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
        done
          ? 'border-success bg-success-soft text-success'
          : 'border-slate-300 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
      }`}
    >
      {done ? (
        <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
      ) : (
        <Circle className="h-4.5 w-4.5" aria-hidden="true" />
      )}
      {done ? t('step.completed') : t('step.markComplete')}
    </button>
  );

  // ---- Compact mode: minimal operational checklist row -------------------
  if (compact) {
    return (
      <div className="step-card rounded-card border border-slate-200 bg-white p-4 card-shadow">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Badge tone={gating.tone}>{t(gating.labelKey)}</Badge>
            </div>
            <h3 className="text-base font-semibold text-ink">
              {step.compactLabel ?? step.title}
            </h3>
          </div>
          {completionToggle}
        </div>
        {step.navPath && (
          <p className="mt-2 text-sm text-muted">
            {step.navPath.segments.join(' › ')}
          </p>
        )}
        {step.copyBlocks && step.copyBlocks.length > 0 && (
          <div className="mt-3 space-y-2">
            {step.copyBlocks.map((cb) => (
              <CopyBlock key={cb.id} block={cb} compact />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---- Beginner mode: full explanatory card ------------------------------
  return (
    <article
      className="step-card rounded-card border border-slate-200 bg-white p-6 card-shadow"
      aria-labelledby={`step-${step.id}-title`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone={gating.tone}>{t(gating.labelKey)}</Badge>
            {done && (
              <Badge tone="success" icon={<CheckCircle2 className="h-3 w-3" />}>
                {t('step.done')}
              </Badge>
            )}
          </div>
          <h3
            id={`step-${step.id}-title`}
            className="text-xl font-bold text-ink"
          >
            {step.title}
          </h3>
        </div>
        {completionToggle}
      </header>

      <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
        {step.summary}
      </p>

      {step.navPath && (
        <div className="mt-4">
          <NavPathDisplay path={step.navPath} />
        </div>
      )}

      {step.instructions && step.instructions.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t('step.instructions')}
          </h4>
          <ol className="list-decimal space-y-1.5 pl-5 text-[15px] text-slate-700 marker:font-semibold marker:text-brand-500">
            {step.instructions.map((ins, i) => (
              <li key={i}>{ins}</li>
            ))}
          </ol>
        </div>
      )}

      {step.valuesToEnter && step.valuesToEnter.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t('step.whatToEnter')}
          </h4>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-100">
                {step.valuesToEnter.map((row, i) => (
                  <tr key={i} className="align-top">
                    <th
                      scope="row"
                      className="w-2/5 bg-slate-50 px-3 py-2 font-medium text-slate-600"
                    >
                      {row.field}
                    </th>
                    <td className="px-3 py-2 text-slate-800">
                      {row.copyable ? (
                        <CopyBlock
                          block={{
                            id: `${step.id}-val-${i}`,
                            label: row.field,
                            value: row.value,
                            kind: 'value',
                          }}
                          compact
                        />
                      ) : (
                        row.value
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step.copyBlocks && step.copyBlocks.length > 0 && (
        <div className="mt-4 space-y-3">
          {step.copyBlocks.map((cb) => (
            <CopyBlock key={cb.id} block={cb} />
          ))}
        </div>
      )}

      {step.passCriteria && (
        <div className="mt-4">
          <Callout level="info" title={t('step.passCriteria')}>
            <span className="inline-flex items-start gap-1.5">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden="true" />
              {step.passCriteria}
            </span>
          </Callout>
        </div>
      )}

      {step.whyItMatters && (
        <div className="mt-4">
          <ExpandableSection
            title={t('step.whyMatters')}
            tone="brand"
            icon={<HelpCircle className="h-4 w-4 text-brand-600" aria-hidden="true" />}
          >
            {step.whyItMatters}
          </ExpandableSection>
        </div>
      )}

      {step.beginnerTip && (
        <div className="mt-3">
          <Callout level="tip">{step.beginnerTip}</Callout>
        </div>
      )}

      {step.warnings && step.warnings.length > 0 && (
        <div className="mt-3 space-y-2">
          {step.warnings.map((w) => (
            <Callout key={w.id} level={w.level} title={w.title}>
              {w.body}
            </Callout>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <label
          htmlFor={`note-${step.id}`}
          className="mb-1.5 block text-sm font-semibold text-slate-600"
        >
          {t('step.myNotes')}
        </label>
        <textarea
          id={`note-${step.id}`}
          value={note}
          onChange={(e) =>
            dispatch({
              type: 'SET_NOTE',
              journeyId,
              stepId: step.id,
              note: e.target.value,
            })
          }
          rows={2}
          placeholder={t('step.notesPlaceholder')}
          className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:border-brand-400 focus-visible:ring-2"
        />
      </div>
    </article>
  );
}
