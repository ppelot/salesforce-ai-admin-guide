import { useEffect } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import type { JourneyId, Step } from '../lib/types';
import { getJourney } from '../data';
import { useAppState } from '../lib/state';
import { useRoute } from '../lib/router';
import { useT, useLanguage, type UIKey } from '../lib/i18n';
import { Disclaimer } from './ui/Disclaimer';

const GATING_KEY: Record<Step['gating'], UIKey> = {
  required: 'gating.required',
  recommended: 'gating.recommended',
  optional: 'gating.optional',
};

/**
 * Linearized, print-optimized rendering of a whole journey: every section,
 * step, values, copy snippets (as plain text), checklist, and the validation
 * list. Screen shows a toolbar; print shows only the document.
 */
export function PrintView({ journeyId }: { journeyId: JourneyId }) {
  const t = useT();
  const lang = useLanguage();
  const journey = getJourney(journeyId, lang);
  const state = useAppState();
  const { navigate } = useRoute();
  const prog = state.progress[journeyId];

  // Reset scroll so the printed doc starts at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [journeyId]);

  const box = '☐';
  const checked = '☑';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Toolbar (screen only) */}
      <div className="print-hidden mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate({ kind: 'journey', journeyId })}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('print.backTo', { title: journey.title })}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          {t('print.printSave')}
        </button>
      </div>

      {/* Printable document */}
      <article className="print-block space-y-6 text-slate-800">
        <header className="border-b border-slate-300 pb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t('print.docHeader')}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{journey.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{journey.tagline}</p>
          <p className="mt-2 text-sm text-slate-700">{journey.purpose}</p>
        </header>

        {journey.sections.map((section, sIdx) => (
          <section
            key={section.id}
            className="print-card break-inside-avoid space-y-3"
          >
            <h2 className="text-lg font-bold text-ink">
              {section.phaseNumber !== undefined
                ? t('print.phase', { n: section.phaseNumber })
                : `${sIdx + 1}. `}
              {section.title}
            </h2>
            {section.intro && (
              <p className="text-sm text-slate-700">{section.intro}</p>
            )}
            {section.doneWhen && (
              <p className="text-sm text-slate-700">
                <strong>{t('print.doneWhen')}</strong> {section.doneWhen}
              </p>
            )}

            {/* Steps */}
            {section.steps.map((step) => {
              const isDone = prog.steps[step.id] === true;
              return (
                <div
                  key={step.id}
                  className="step-card break-inside-avoid border-l-2 border-slate-200 pl-3"
                >
                  <h3 className="text-[15px] font-semibold text-ink">
                    {isDone ? checked : box} {step.title}
                    <span className="ml-2 align-middle text-xs font-normal uppercase tracking-wide text-slate-400">
                      {t(GATING_KEY[step.gating])}
                    </span>
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-700">{step.summary}</p>

                  {step.navPath && (
                    <p className="mt-1 text-sm text-slate-600">
                      <strong>{t('print.where')}</strong>{' '}
                      {step.navPath.segments.join(' › ')}
                      {step.navPath.quickFind && (
                        <> — {t('print.quickFind')} “{step.navPath.quickFind}”</>
                      )}
                    </p>
                  )}

                  {step.instructions && step.instructions.length > 0 && (
                    <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm text-slate-700">
                      {step.instructions.map((ins, i) => (
                        <li key={i}>{ins}</li>
                      ))}
                    </ol>
                  )}

                  {step.valuesToEnter && step.valuesToEnter.length > 0 && (
                    <table className="mt-1.5 w-full border-collapse text-sm">
                      <tbody>
                        {step.valuesToEnter.map((row, i) => (
                          <tr key={i} className="border-b border-slate-100">
                            <th
                              scope="row"
                              className="py-1 pr-3 text-left align-top font-medium text-slate-600"
                            >
                              {row.field}
                            </th>
                            <td className="py-1 font-mono text-[13px] text-slate-800">
                              {row.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {step.copyBlocks?.map((cb) => (
                    <div key={cb.id} className="mt-1.5">
                      <p className="text-xs font-semibold text-slate-500">
                        {cb.label}
                      </p>
                      <pre className="code-wrap whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 p-2 font-mono text-[12px] text-slate-800">
                        {cb.value}
                      </pre>
                    </div>
                  ))}

                  {step.passCriteria && (
                    <p className="mt-1 text-sm text-slate-700">
                      <strong>{t('print.passCriteria')}</strong> {step.passCriteria}
                    </p>
                  )}

                  {step.warnings?.map((w) => (
                    <p key={w.id} className="mt-1 text-sm text-slate-700">
                      <strong>
                        {w.level === 'blocker'
                          ? t('print.blocker')
                          : t('print.warning')}
                        :
                      </strong>{' '}
                      {w.title} — {w.body}
                    </p>
                  ))}
                </div>
              );
            })}

            {/* Checklist */}
            {section.checklist.length > 0 && (
              <div className="break-inside-avoid">
                <h4 className="text-sm font-bold text-ink">
                  {t('print.checklist')}
                </h4>
                <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
                  {section.checklist.map((item) => (
                    <li key={item.id} className="checklist-item">
                      {prog.checks[item.id] === true ? checked : box}{' '}
                      {item.label}
                      {item.blocking && (
                        <span className="ml-1 text-xs uppercase text-slate-400">
                          {t('print.required')}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}

        {/* Validation */}
        {journey.validation.length > 0 && (
          <section className="print-card break-inside-avoid space-y-2">
            <h2 className="text-lg font-bold text-ink">
              {t('print.validationChecklist')}
            </h2>
            <ul className="space-y-1 text-sm text-slate-700">
              {journey.validation.map((v) => (
                <li key={v.id} className="checklist-item">
                  {prog.checks[v.id] === true ? checked : box} <strong>{v.label}</strong>{' '}
                  — {v.how}
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="border-t border-slate-300 pt-3">
          <Disclaimer compact />
        </footer>
      </article>
    </div>
  );
}
