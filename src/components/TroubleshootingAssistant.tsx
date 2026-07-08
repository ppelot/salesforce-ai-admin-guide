import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  LayoutList,
  Stethoscope,
  Table as TableIcon,
  Wrench,
} from 'lucide-react';
import type { JourneyId, TroubleshootingEntry } from '../lib/types';
import {
  getJourneys,
  getQuickReference,
  getTroubleshooting,
} from '../data';
import { useRoute } from '../lib/router';
import { useT, useLanguage, type UIKey } from '../lib/i18n';
import { Badge } from './ui/Badge';
import { Callout } from './ui/Callout';

type FilterId = 'all' | JourneyId;

const JOURNEY_LABEL_KEY: Record<TroubleshootingEntry['journeyId'], UIKey> = {
  agentforce: 'ts.journeyLabel.agentforce',
  prompts: 'ts.journeyLabel.prompts',
  both: 'ts.journeyLabel.both',
};

/** Find the section that contains a step, to build a deep link. */
function findSectionForStep(
  journeys: ReturnType<typeof getJourneys>,
  journeyId: JourneyId,
  stepId: string,
): string | undefined {
  const journey = journeys[journeyId];
  for (const section of journey.sections) {
    if (section.steps.some((s) => s.id === stepId)) return section.id;
  }
  return undefined;
}

/** One resolved entry: cause, fix, and a link to the related step. */
function EntryDetail({ entry }: { entry: TroubleshootingEntry }) {
  const { navigate } = useRoute();
  const t = useT();
  const lang = useLanguage();
  const linkJourney = entry.journeyId === 'both' ? 'prompts' : entry.journeyId;
  const sectionId = entry.relatedStepId
    ? findSectionForStep(getJourneys(lang), linkJourney, entry.relatedStepId)
    : undefined;

  return (
    <div className="space-y-3">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <AlertCircle className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
          {t('ts.likelyCause')}
        </p>
        <p className="mt-1 text-sm text-slate-700">{entry.cause}</p>
      </div>
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Wrench className="h-3.5 w-3.5 text-success" aria-hidden="true" />
          {t('ts.howToFix')}
        </p>
        <p className="mt-1 text-sm text-slate-700">{entry.fix}</p>
      </div>
      {entry.relatedStepId && sectionId && (
        <button
          type="button"
          onClick={() =>
            navigate({
              kind: 'journey',
              journeyId: linkJourney,
              sectionId,
            })
          }
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
        >
          {t('ts.goToStep')}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function TroubleshootingAssistant({ symptomId }: { symptomId?: string }) {
  const t = useT();
  const lang = useLanguage();
  const troubleshooting = getTroubleshooting(lang);
  const { bestPractices, commonErrors, limits, limitsNote } =
    getQuickReference(lang);
  const [filter, setFilter] = useState<FilterId>('all');
  const [view, setView] = useState<'assistant' | 'table'>('assistant');
  const [selectedId, setSelectedId] = useState<string>(
    symptomId ?? troubleshooting[0]?.id ?? '',
  );

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? troubleshooting
        : troubleshooting.filter(
            (e) => e.journeyId === filter || e.journeyId === 'both',
          ),
    [filter, troubleshooting],
  );

  // Keep the selected symptom valid within the active filter.
  const selected =
    filtered.find((e) => e.id === selectedId) ?? filtered[0] ?? null;

  const filters: { id: FilterId; labelKey: UIKey }[] = [
    { id: 'all', labelKey: 'ts.filter.all' },
    { id: 'agentforce', labelKey: 'ts.journeyLabel.agentforce' },
    { id: 'prompts', labelKey: 'ts.journeyLabel.prompts' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
          <Stethoscope className="h-6 w-6 text-brand-600" aria-hidden="true" />
          {t('ts.h1')}
        </h1>
        <p className="mt-1.5 text-[15px] text-muted">{t('ts.helper')}</p>
      </header>

      {/* Controls */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t('ts.filterByJourney')}
        >
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f.id
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
              }`}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>

        <div className="inline-flex overflow-hidden rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setView('assistant')}
            aria-pressed={view === 'assistant'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${
              view === 'assistant'
                ? 'bg-brand-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutList className="h-4 w-4" aria-hidden="true" />
            {t('ts.view.assistant')}
          </button>
          <button
            type="button"
            onClick={() => setView('table')}
            aria-pressed={view === 'table'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${
              view === 'table'
                ? 'bg-brand-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <TableIcon className="h-4 w-4" aria-hidden="true" />
            {t('ts.view.table')}
          </button>
        </div>
      </div>

      {/* Assistant view */}
      {view === 'assistant' && (
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          {/* Symptom list */}
          <div>
            <label
              htmlFor="symptom-select"
              className="mb-1 block text-sm font-semibold text-slate-600"
            >
              {t('ts.symptomQuestion')}
            </label>
            <select
              id="symptom-select"
              value={selected?.id ?? ''}
              onChange={(e) => setSelectedId(e.target.value)}
              className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:border-brand-400 focus-visible:ring-2"
            >
              {filtered.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.symptom}
                </option>
              ))}
            </select>

            <ul className="hidden space-y-1.5 sm:block">
              {filtered.map((e) => {
                const active = e.id === selected?.id;
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(e.id)}
                      aria-current={active ? 'true' : undefined}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        active
                          ? 'border-brand-300 bg-brand-50 text-brand-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200'
                      }`}
                    >
                      {e.symptom}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Detail */}
          <div>
            {selected ? (
              <div className="rounded-card border border-slate-200 bg-white p-5 card-shadow">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">
                    {t(JOURNEY_LABEL_KEY[selected.journeyId])}
                  </Badge>
                </div>
                <h2 className="mb-3 text-lg font-bold text-ink">
                  {selected.symptom}
                </h2>
                <EntryDetail entry={selected} />
              </div>
            ) : (
              <p className="rounded-card border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-muted">
                {t('ts.noEntries')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <div className="overflow-x-auto rounded-card border border-slate-200 bg-white card-shadow">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('ts.col.symptom')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('ts.col.cause')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('ts.col.fix')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((e) => (
                <tr key={e.id} className="align-top">
                  <th
                    scope="row"
                    className="px-4 py-3 font-semibold text-ink"
                  >
                    {e.symptom}
                  </th>
                  <td className="px-4 py-3 text-slate-600">{e.cause}</td>
                  <td className="px-4 py-3 text-slate-700">{e.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick reference */}
      <section className="mt-10" aria-labelledby="quickref-heading">
        <h2 id="quickref-heading" className="mb-4 text-xl font-bold text-ink">
          {t('ts.quickRef')}
        </h2>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Best practices */}
          <div className="rounded-card border border-slate-200 bg-white p-5 card-shadow">
            <h3 className="mb-3 text-base font-bold text-ink">
              {t('ts.bestPractices')}
            </h3>
            <ul className="space-y-2.5">
              {bestPractices.map((bp) => (
                <li key={bp.practice} className="text-sm">
                  <p className="font-semibold text-slate-800">{bp.practice}</p>
                  <p className="text-slate-600">{bp.why}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Limits */}
          <div className="rounded-card border border-slate-200 bg-white p-5 card-shadow">
            <h3 className="mb-3 text-base font-bold text-ink">
              {t('ts.limits')}
            </h3>
            <dl className="divide-y divide-slate-100">
              {limits.map((row) => (
                <div key={row.limit} className="flex justify-between gap-3 py-2">
                  <dt className="text-sm text-slate-600">{row.limit}</dt>
                  <dd className="text-right text-sm font-semibold text-slate-800">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-3">
              <Callout level="info">{limitsNote}</Callout>
            </div>
          </div>
        </div>

        {/* Common errors */}
        <div className="mt-4 overflow-x-auto rounded-card border border-slate-200 bg-white card-shadow">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              {t('ts.commonErrorsCaption')}
            </caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('ts.col.error')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('ts.col.cause')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('ts.col.fix')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commonErrors.map((e) => (
                <tr key={e.error} className="align-top">
                  <th scope="row" className="px-4 py-3 font-medium text-ink">
                    {e.error}
                  </th>
                  <td className="px-4 py-3 text-slate-600">{e.cause}</td>
                  <td className="px-4 py-3 text-slate-700">{e.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
