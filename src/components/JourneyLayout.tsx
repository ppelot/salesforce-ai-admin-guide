import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Home as HomeIcon,
  Printer,
} from 'lucide-react';
import type { Journey } from '../lib/types';
import { useAppDispatch, useAppState } from '../lib/state';
import { computeJourneyProgress } from '../lib/progress';
import { useRoute } from '../lib/router';
import { getIcon } from '../lib/icons';
import { useT } from '../lib/i18n';
import { StepCard } from './StepCard';
import { Checklist } from './Checklist';
import { Badge } from './ui/Badge';
import { Callout } from './ui/Callout';

export function JourneyLayout({
  journey,
  sectionId,
}: {
  journey: Journey;
  sectionId?: string;
}) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { navigate } = useRoute();
  const t = useT();
  const mode = state.mode;
  const compact = mode === 'compact';

  // Resolve the active section from the route (default: first section).
  const activeIndex = useMemo(() => {
    const idx = journey.sections.findIndex((s) => s.id === sectionId);
    return idx === -1 ? 0 : idx;
  }, [journey.sections, sectionId]);

  const activeSection = journey.sections[activeIndex];
  const summary = computeJourneyProgress(journey, state.progress[journey.id]);
  const JourneyIcon = getIcon(journey.icon);

  // Remember this as the user's active journey (for Home "Resume").
  useEffect(() => {
    dispatch({ type: 'SET_SELECTED_JOURNEY', journeyId: journey.id });
  }, [dispatch, journey.id]);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const [announce, setAnnounce] = useState('');

  const goToSection = (idx: number) => {
    const target = journey.sections[idx];
    if (!target) return;
    navigate({ kind: 'journey', journeyId: journey.id, sectionId: target.id });
    setAnnounce(t('journey.announce', { title: target.title }));
    // Move focus to the section heading for keyboard/screen-reader users.
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const isFirst = activeIndex === 0;
  const isLast = activeIndex === journey.sections.length - 1;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* Journey header */}
      <div className="mb-5">
        <button
          type="button"
          onClick={() => navigate({ kind: 'home' })}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
        >
          <HomeIcon className="h-4 w-4" aria-hidden="true" />
          {t('journey.home')}
        </button>
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-brand-50 p-2.5 text-brand-600 ring-1 ring-inset ring-brand-100">
            <JourneyIcon className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-ink">{journey.title}</h1>
            <p className="mt-0.5 text-sm text-muted">{journey.tagline}</p>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">
              {t('journey.stepsComplete', {
                completed: summary.completedSteps,
                total: summary.totalSteps,
              })}
            </span>
            <span className="font-semibold text-brand-700">{summary.percent}%</span>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuenow={summary.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('journey.progressAria', { title: journey.title })}
          >
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${summary.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Prompts journey intro */}
      {journey.id === 'prompts' && (
        <div className="mt-5 rounded-lg border border-pink-100 p-4" style={{ backgroundColor: '#FEF0F3' }}>
          <p className="text-sm leading-relaxed text-slate-700">
            {t('journey.promptsIntro1')}
            <a
              href="#/library/account-summary-prompt"
              className="font-bold text-brand-700 underline hover:text-brand-900"
            >
              {t('journey.promptsIntroBold')}
            </a>
            {t('journey.promptsIntro2')}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-700">
            {t('journey.promptsIntroNote1')}
            <a
              href="#/library"
              className="font-bold text-brand-700 underline hover:text-brand-900"
            >
              {t('journey.promptsIntroNoteLink')}
            </a>
            {t('journey.promptsIntroNote2')}
          </p>
        </div>
      )}

      {/* Section tabs (jump to any section) */}
      <nav aria-label={t('journey.sectionsNav')} className="mb-5 print-hidden">
        <ol className="flex flex-wrap gap-2">
          {journey.sections.map((s, idx) => {
            const secSummary = summary.perSection[idx];
            const complete = secSummary.total > 0 && secSummary.completed === secSummary.total;
            const isActive = idx === activeIndex;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => goToSection(idx)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
                  }`}
                >
                  {complete && (
                    <CheckCircle2
                      className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-success'}`}
                      aria-hidden="true"
                    />
                  )}
                  {s.phaseNumber !== undefined && (
                    <span className={isActive ? 'text-brand-100' : 'text-slate-400'}>
                      P{s.phaseNumber}
                    </span>
                  )}
                  {s.title}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <p aria-live="polite" className="sr-only">
        {announce}
      </p>

      {/* Active section */}
      <section aria-labelledby="active-section-title">
        <div className="mb-4 rounded-card border border-slate-200 bg-white p-5 card-shadow">
          <div className="flex flex-wrap items-center gap-2">
            {activeSection.phaseNumber !== undefined && (
              <Badge tone="brand">
                {t('journey.phaseBadge', { n: activeSection.phaseNumber })}
              </Badge>
            )}
            <h2
              id="active-section-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-xl font-bold text-ink outline-none"
            >
              {activeSection.title}
            </h2>
          </div>
          {activeSection.intro && (
            <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
              {activeSection.intro}
            </p>
          )}
          {activeSection.doneWhen && (
            <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
              <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                <strong>{t('journey.doneWhen')}</strong> {activeSection.doneWhen}
              </span>
            </p>
          )}
          {activeSection.warnings?.map((w) => (
            <div key={w.id} className="mt-3">
              <Callout level={w.level} title={w.title}>
                {w.body}
              </Callout>
            </div>
          ))}
        </div>

        {/* Inline mode toggle */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-brand-100 bg-brand-50/50 px-4 py-2.5 print-hidden">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Eye className="h-4 w-4 text-brand-500" aria-hidden="true" />
            <span className="font-medium">
              {compact ? t('mode.compact') : t('mode.beginner')}
            </span>
            <span className="hidden text-slate-400 sm:inline">—</span>
            <span className="hidden text-xs text-slate-400 sm:inline">
              {compact
                ? 'Checklist view for experienced admins'
                : 'Full explanations, tips & context'}
            </span>
          </div>
          <div
            className="inline-flex overflow-hidden rounded-lg border border-brand-200 shadow-sm"
            role="group"
          >
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_MODE', mode: 'beginner' })}
              aria-pressed={!compact}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                !compact
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t('mode.beginner')}
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_MODE', mode: 'compact' })}
              aria-pressed={compact}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                compact
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t('mode.compact')}
            </button>
          </div>
        </div>

        {/* Steps */}
        {activeSection.steps.length > 0 ? (
          <div className="space-y-4">
            {activeSection.steps.map((step) => (
              <StepCard
                key={step.id}
                step={step}
                journeyId={journey.id}
                compact={compact}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-card border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-muted">
            {t('journey.emptySection')}
          </p>
        )}

        {/* Checklist */}
        <div className="mt-5">
          <Checklist section={activeSection} journeyId={journey.id} />
        </div>
      </section>

      {/* Prev / Next + validation */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 print-hidden">
        <button
          type="button"
          onClick={() => goToSection(activeIndex - 1)}
          disabled={isFirst}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('journey.previous')}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate({ kind: 'print', journeyId: journey.id })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            {t('journey.print')}
          </button>
          <button
            type="button"
            onClick={() => navigate({ kind: 'validate', journeyId: journey.id })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
          >
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            {t('journey.validation')}
            {summary.readyForValidation && (
              <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
            )}
          </button>
        </div>

        {!isLast ? (
          <button
            type="button"
            onClick={() => goToSection(activeIndex + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {t('journey.next')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate({ kind: 'validate', journeyId: journey.id })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-95"
          >
            {t('journey.finish')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
