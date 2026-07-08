import { CheckCircle2, ListChecks } from 'lucide-react';
import type { GoNoGo, JourneyId, Section } from '../lib/types';
import { useAppDispatch, useAppState } from '../lib/state';
import { computeChecklistStatus } from '../lib/progress';
import { useT, type UIKey } from '../lib/i18n';
import { Badge, type BadgeTone } from './ui/Badge';

const GONOGO: Record<GoNoGo, { tone: BadgeTone; labelKey: UIKey }> = {
  go: { tone: 'success', labelKey: 'gonogo.go' },
  partial: { tone: 'warning', labelKey: 'gonogo.partial' },
  'no-go': { tone: 'neutral', labelKey: 'gonogo.noGo' },
};

export function Checklist({
  section,
  journeyId,
}: {
  section: Section;
  journeyId: JourneyId;
}) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();
  const prog = state.progress[journeyId];

  if (section.checklist.length === 0) return null;

  const status = computeChecklistStatus(section, prog);
  const badge = GONOGO[status];

  return (
    <section
      className="rounded-card border border-slate-200 bg-white p-5 card-shadow"
      aria-labelledby={`checklist-${section.id}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3
          id={`checklist-${section.id}`}
          className="flex items-center gap-2 text-base font-bold text-ink"
        >
          <ListChecks className="h-5 w-5 text-brand-600" aria-hidden="true" />
          {section.phaseNumber !== undefined
            ? t('checklist.phase')
            : t('checklist.section')}
        </h3>
        <Badge
          tone={badge.tone}
          icon={
            status === 'go' ? <CheckCircle2 className="h-3 w-3" /> : undefined
          }
        >
          {t(badge.labelKey)}
        </Badge>
      </div>

      <ul className="space-y-2">
        {section.checklist.map((item) => {
          const checked = prog.checks[item.id] === true;
          return (
            <li
              key={item.id}
              className="checklist-item flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5"
            >
              <input
                type="checkbox"
                id={`check-${item.id}`}
                checked={checked}
                onChange={(e) =>
                  dispatch({
                    type: 'TOGGLE_CHECK',
                    journeyId,
                    checkId: item.id,
                    checked: e.target.checked,
                  })
                }
                className="mt-0.5 h-4.5 w-4.5 shrink-0 rounded border-slate-300 text-brand-600 focus-visible:ring-2"
              />
              <label
                htmlFor={`check-${item.id}`}
                className="flex-1 cursor-pointer text-sm text-slate-700"
              >
                <span className={checked ? 'text-slate-400 line-through' : ''}>
                  {item.label}
                </span>
                {item.blocking && (
                  <span className="ml-1.5 align-middle">
                    <Badge tone="danger">{t('checklist.required')}</Badge>
                  </span>
                )}
                {item.helpText && (
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {item.helpText}
                  </span>
                )}
              </label>
            </li>
          );
        })}
      </ul>

      {status === 'go' && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {t('checklist.ready')}
        </p>
      )}
    </section>
  );
}
