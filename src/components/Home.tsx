import type { ReactNode } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Info,
  Sparkles,
  Workflow,
  Wrench,
} from 'lucide-react';
import { getJourneyList } from '../data';
import { useAppState } from '../lib/state';
import { computeJourneyProgress } from '../lib/progress';
import { useRoute } from '../lib/router';
import { getIcon } from '../lib/icons';
import { useT, useLanguage, type UIKey, type TFn } from '../lib/i18n';
import { Badge } from './ui/Badge';
import { Disclaimer } from './ui/Disclaimer';

/**
 * Render a template containing a single `{s}` placeholder, wrapping the
 * emphasized fragment (from `strongKey`) in <strong>. Keeps the bold phrase
 * translatable without embedding markup in the dictionary.
 */
function withStrong(t: TFn, templateKey: UIKey, strongKey: UIKey): ReactNode {
  // Calling t() with no params leaves the literal "{s}" marker in place so we
  // can split on it and inject the <strong> fragment.
  const [before, after] = t(templateKey).split('{s}');
  return (
    <>
      {before}
      <strong>{t(strongKey)}</strong>
      {after}
    </>
  );
}

export function Home() {
  const state = useAppState();
  const { navigate } = useRoute();
  const t = useT();
  const lang = useLanguage();
  const journeyList = getJourneyList(lang);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Hero image */}
      <div className="mb-6 flex justify-center">
        <img
          src="https://nncourage.com/img/Agentforce-04.png"
          alt="Agentforce"
          className="w-full max-w-3xl rounded-xl object-cover"
        />
      </div>

      {/* Hero */}
      <header className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 ring-1 ring-inset ring-brand-100">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {t('home.badge')}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {t('home.h1')}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-muted">
          {t('home.subtitle')}
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
          {t('home.choosePath')}
        </p>
      </header>

      {/* Journey cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {journeyList.map((journey) => {
          const summary = computeJourneyProgress(
            journey,
            state.progress[journey.id],
          );
          const Icon = getIcon(journey.icon);
          const started = summary.completedSteps > 0;
          return (
            <button
              key={journey.id}
              type="button"
              onClick={() => navigate({ kind: 'journey', journeyId: journey.id })}
              className="group flex flex-col rounded-card border border-slate-200 p-6 text-left card-shadow transition-all hover:-translate-y-0.5 hover:border-brand-300 focus-visible:ring-2"
              style={{ backgroundColor: journey.id === 'agentforce' ? '#EAF5FE' : journey.id === 'prompts' ? '#F9F0FF' : 'white' }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-xl bg-brand-50 p-3 text-brand-600 ring-1 ring-inset ring-brand-100">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                {started && (
                  <Badge tone="brand">
                    {t('home.percentDone', { percent: summary.percent })}
                  </Badge>
                )}
              </div>

              {journey.id === 'agentforce' && (
                <img
                  src="https://i.ytimg.com/vi/RKAmQXw6ZlE/maxresdefault.jpg"
                  alt="Activate Agentforce Coworker"
                  className="mb-4 w-full rounded-lg object-cover"
                />
              )}
              {journey.id === 'prompts' && (
                <img
                  src="https://wp.sfdcdigital.com/en-us/wp-content/uploads/sites/4/2024/02/Introducing-Prompt-Builder-1.jpg?w=1024"
                  alt="Use Personalized AI Prompts"
                  className="mb-4 w-full rounded-lg object-cover"
                />
              )}

              <h2 className="text-xl font-bold text-ink">{journey.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {journey.purpose}
              </p>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex gap-2">
                  <dt className="font-semibold text-slate-500">
                    {t('home.difficulty')}
                  </dt>
                  <dd className="text-slate-700">{journey.difficulty}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">
                    {t('home.includes')}
                  </dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {journey.includes.map((item) => (
                      <Badge key={item} tone="neutral">
                        {item}
                      </Badge>
                    ))}
                  </dd>
                </div>
              </dl>

              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 group-hover:gap-2.5 group-hover:transition-all">
                {started ? t('home.resume') : t('home.start')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>

      {/* What should I do first? */}
      <section className="mt-6 rounded-card border border-brand-100 bg-brand-50/60 p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-brand-800">
          <Compass className="h-5 w-5" aria-hidden="true" />
          {t('home.firstHeading')}
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            {withStrong(t, 'home.first1', 'home.first1.s')}
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            {withStrong(t, 'home.first2', 'home.first2.s')}
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            {withStrong(t, 'home.first3', 'home.first3.s')}
          </li>
        </ul>
      </section>

      {/* Quick tiles */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <button
          type="button"
          onClick={() => navigate({ kind: 'guide' })}
          className="flex items-center gap-3 rounded-card border border-brand-200 bg-brand-50/50 p-4 text-left card-shadow transition-colors hover:border-brand-400 hover:bg-brand-50"
        >
          <Workflow className="h-6 w-6 text-brand-600" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">Build Flow</p>
            <p className="text-xs text-slate-500">Step-by-step flow guide</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => navigate({ kind: 'library' })}
          className="flex items-center gap-3 rounded-card border border-slate-200 bg-white p-4 text-left card-shadow transition-colors hover:border-brand-300"
        >
          <BookOpen className="h-6 w-6 text-brand-600" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">{t('home.tile.library.title')}</p>
            <p className="text-xs text-slate-500">{t('home.tile.library.sub')}</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => navigate({ kind: 'troubleshoot' })}
          className="flex items-center gap-3 rounded-card border border-slate-200 bg-white p-4 text-left card-shadow transition-colors hover:border-brand-300"
        >
          <Wrench className="h-6 w-6 text-brand-600" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">{t('home.tile.troubleshoot.title')}</p>
            <p className="text-xs text-slate-500">{t('home.tile.troubleshoot.sub')}</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => navigate({ kind: 'search', q: '' })}
          className="flex items-center gap-3 rounded-card border border-slate-200 bg-white p-4 text-left card-shadow transition-colors hover:border-brand-300"
        >
          <Info className="h-6 w-6 text-brand-600" aria-hidden="true" />
          <div>
            <p className="font-semibold text-ink">{t('home.tile.search.title')}</p>
            <p className="text-xs text-slate-500">{t('home.tile.search.sub')}</p>
          </div>
        </button>
      </div>

      <div className="mt-8">
        <Disclaimer />
      </div>

      {/* Credit */}
      <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
        <p className="inline-flex items-center gap-1.5">
          Created by{' '}
          <a
            href="https://salesforce.enterprise.slack.com/team/U01G8QJC2AW"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-800 hover:underline"
          >
            <img
              src="https://assets-v2.lottiefiles.com/a/bb1cc7d6-07ca-4b63-807b-7700caf111e0/QYIeYh2AK9.gif"
              alt=""
              className="h-5 w-5"
              aria-hidden="true"
            />
            Patrick Pelot
          </a>
        </p>
      </footer>
    </div>
  );
}
