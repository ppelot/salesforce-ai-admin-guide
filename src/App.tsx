import { useEffect, useState } from 'react';
import {
  BookOpen,
  Home as HomeIcon,
  Languages,
  Lock,
  RotateCcw,
  Search as SearchIcon,
  Sparkles,
  Stethoscope,
  Workflow,
} from 'lucide-react';
import { useRoute } from './lib/router';
import { useAppDispatch, useAppState } from './lib/state';
import { useT, useLanguage } from './lib/i18n';
import type { Language } from './lib/types';
import { getJourneys } from './data';
import { Home } from './components/Home';
import { JourneyLayout } from './components/JourneyLayout';
import { ProgressPanel } from './components/ProgressPanel';
import { Search } from './components/Search';
import { PromptLibrary } from './components/PromptLibrary';
import { TroubleshootingAssistant } from './components/TroubleshootingAssistant';
import { ValidationDashboard } from './components/ValidationDashboard';
import { PrintView } from './components/PrintView';
import { BuildFlowGuide } from './components/BuildFlowGuide';
import { Disclaimer } from './components/ui/Disclaimer';

// ---------------------------------------------------------------------------
// Password gate
// ---------------------------------------------------------------------------

const PASS_KEY = 'sf-admin-guide-auth';
const CORRECT_PASSWORD = 'Agentforce2026';

function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem(PASS_KEY) === 'true';
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (authenticated) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(PASS_KEY, 'true');
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-brand-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg"
      >
        <div className="mb-6 flex flex-col items-center gap-3">
          <span className="rounded-xl bg-brand-600 p-3 text-white">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-bold text-ink">Access Required</h1>
          <p className="text-center text-sm text-muted">
            Enter the password to access the Salesforce AI Admin Setup Guide.
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="gate-password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="gate-password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Enter password"
              autoFocus
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                error
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-300 focus:border-brand-400 focus:ring-brand-100'
              }`}
            />
            {error && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                Incorrect password. Please try again.
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            Unlock
          </button>
        </div>
      </form>
    </div>
  );
}

/** Beginner / Compact mode switch. */
function ModeToggle() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();
  const compact = state.mode === 'compact';
  return (
    <div
      className="inline-flex shrink-0 overflow-hidden rounded-lg border border-slate-200"
      role="group"
      aria-label={t('mode.group')}
    >
      <button
        type="button"
        onClick={() => dispatch({ type: 'SET_MODE', mode: 'beginner' })}
        aria-pressed={!compact}
        className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
          !compact ? 'bg-brand-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        {t('mode.beginner')}
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: 'SET_MODE', mode: 'compact' })}
        aria-pressed={compact}
        className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
          compact ? 'bg-brand-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        {t('mode.compact')}
      </button>
    </div>
  );
}

/** FR / EN language switch. French is the default. */
function LanguageToggle() {
  const lang = useLanguage();
  const dispatch = useAppDispatch();
  const t = useT();
  const set = (language: Language) => dispatch({ type: 'SET_LANGUAGE', language });
  const options: { value: Language; labelKey: 'lang.fr' | 'lang.en'; titleKey: 'lang.frFull' | 'lang.enFull' }[] = [
    { value: 'fr', labelKey: 'lang.fr', titleKey: 'lang.frFull' },
    { value: 'en', labelKey: 'lang.en', titleKey: 'lang.enFull' },
  ];
  return (
    <div
      className="inline-flex shrink-0 items-center overflow-hidden rounded-lg border border-slate-200"
      role="group"
      aria-label={t('lang.group')}
    >
      <Languages
        className="ml-2 mr-0.5 hidden h-3.5 w-3.5 text-slate-400 sm:inline"
        aria-hidden="true"
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => set(o.value)}
          aria-pressed={lang === o.value}
          title={t(o.titleKey)}
          className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            lang === o.value
              ? 'bg-brand-500 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t(o.labelKey)}
        </button>
      ))}
    </div>
  );
}

/** Header search box: submits to #/search?q=... */
function HeaderSearch() {
  const { route, navigate } = useRoute();
  const t = useT();
  const [q, setQ] = useState(route.kind === 'search' ? route.q : '');

  useEffect(() => {
    if (route.kind === 'search') setQ(route.q);
  }, [route]);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ kind: 'search', q });
      }}
      className="relative hidden sm:block"
    >
      <label htmlFor="header-search" className="sr-only">
        {t('header.searchLabel')}
      </label>
      <SearchIcon
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        id="header-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('header.searchPlaceholder')}
        className="w-40 rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-2 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:w-56 focus-visible:border-brand-400 focus-visible:ring-2 lg:w-52"
        autoComplete="off"
      />
    </form>
  );
}

function ResetButton() {
  const dispatch = useAppDispatch();
  const t = useT();
  const onReset = () => {
    const ok = window.confirm(t('reset.confirm'));
    if (ok) dispatch({ type: 'RESET_ALL' });
  };
  return (
    <button
      type="button"
      onClick={onReset}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-red-300 hover:text-danger"
      title={t('reset.title')}
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden md:inline">{t('reset.label')}</span>
    </button>
  );
}

function Header() {
  const { route, navigate } = useRoute();
  const t = useT();
  const navLinks: { kind: 'library' | 'troubleshoot' | 'guide'; label: string; icon: typeof BookOpen }[] = [
    { kind: 'library', label: t('nav.library'), icon: BookOpen },
    { kind: 'guide', label: 'Flow', icon: Workflow },
    { kind: 'troubleshoot', label: t('nav.troubleshoot'), icon: Stethoscope },
  ];

  return (
    <header className="print-hidden sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <button
          type="button"
          onClick={() => navigate({ kind: 'home' })}
          className="flex items-center gap-2 text-left"
        >
          <span className="rounded-lg bg-brand-600 p-1.5 text-white">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="hidden font-bold text-ink sm:inline">
            {t('header.brand')}
          </span>
        </button>

        <nav aria-label={t('nav.primary')} className="ml-1 flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate({ kind: 'home' })}
            aria-current={route.kind === 'home' ? 'page' : undefined}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
              route.kind === 'home'
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <HomeIcon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('nav.home')}</span>
          </button>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = route.kind === link.kind;
            return (
              <button
                key={link.kind}
                type="button"
                onClick={() => navigate({ kind: link.kind })}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden md:inline">{link.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <HeaderSearch />
          <LanguageToggle />
          <ModeToggle />
          <ResetButton />
          <span className="hidden h-4 w-px bg-slate-200 sm:inline" aria-hidden="true" />
          <a
            href="https://salesforce.enterprise.slack.com/team/U01G8QJC2AW"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-500 hover:text-brand-600 hover:underline"
          >
            <img
              src="https://assets-v2.lottiefiles.com/a/bb1cc7d6-07ca-4b63-807b-7700caf111e0/QYIeYh2AK9.gif"
              alt=""
              className="h-4 w-4"
              aria-hidden="true"
            />
            Created by Patrick Pelot
          </a>
        </div>
      </div>
    </header>
  );
}

export function App() {
  const { route } = useRoute();
  const t = useT();
  const lang = useLanguage();
  const journeys = getJourneys(lang);

  // Keep the document language attribute in sync for a11y and hyphenation.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Give each route a descriptive document title for accessibility / history.
  useEffect(() => {
    const base = t('docTitle.base');
    let title = base;
    switch (route.kind) {
      case 'journey':
        title = `${journeys[route.journeyId].title} — ${base}`;
        break;
      case 'library':
        title = `${t('docTitle.library')} — ${base}`;
        break;
      case 'troubleshoot':
        title = `${t('docTitle.troubleshoot')} — ${base}`;
        break;
      case 'validate':
        title = `${t('docTitle.validate')} — ${base}`;
        break;
      case 'search':
        title = `${t('docTitle.search')} — ${base}`;
        break;
      case 'print':
        title = `${t('docTitle.print')} — ${base}`;
        break;
      case 'guide':
        title = `Build Flow — ${base}`;
        break;
    }
    document.title = title;
  }, [route, t, journeys]);

  let content: React.ReactNode;
  switch (route.kind) {
    case 'home':
      content = <Home />;
      break;
    case 'journey':
      content = (
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-0 py-0 lg:flex-row lg:px-6 lg:py-6">
          <div className="min-w-0 flex-1">
            <JourneyLayout
              journey={journeys[route.journeyId]}
              sectionId={route.sectionId}
            />
          </div>
          <div className="px-4 pb-6 sm:px-6 lg:px-0 lg:pt-6">
            <ProgressPanel journey={journeys[route.journeyId]} />
          </div>
        </div>
      );
      break;
    case 'library':
      content = <PromptLibrary promptId={route.promptId} />;
      break;
    case 'troubleshoot':
      content = <TroubleshootingAssistant symptomId={route.symptomId} />;
      break;
    case 'validate':
      content = <ValidationDashboard journeyId={route.journeyId} />;
      break;
    case 'search':
      content = <Search q={route.q} />;
      break;
    case 'print':
      content = <PrintView journeyId={route.journeyId} />;
      break;
    case 'guide':
      content = <BuildFlowGuide />;
      break;
    default:
      content = <Home />;
  }

  return (
    <PasswordGate>
      <div className="min-h-screen">
        <a
          href="#main-content"
          className="sr-only rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          {t('skipLink')}
        </a>

        <Header />

        <main id="main-content">{content}</main>

        <footer className="print-hidden border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
            <Disclaimer compact />
            <p className="mt-3 text-center text-xs text-slate-400">
              {t('footer.tagline')}
            </p>
          </div>
        </footer>
      </div>
    </PasswordGate>
  );
}
