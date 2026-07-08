import { afterEach, describe, expect, it } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { App } from './App';
import { AppStateProvider } from './lib/state';
import { STORAGE_KEY, SCHEMA_VERSION, defaultState } from './lib/storage';
import { UI } from './lib/i18n';
import type { Language } from './lib/types';

afterEach(cleanup);

/** Read the persisted envelope. Saves are debounced ~250ms, so poll for it. */
function readSaved() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

/** Seed a valid persisted envelope so the app boots in a known language. */
function seedLanguage(language: Language) {
  const state = { ...defaultState(), language };
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ schemaVersion: SCHEMA_VERSION, state }),
  );
}

/**
 * Render the app at a route. French is the app default, so tests that assert
 * English strings seed 'en' first. Pass `language = null` to leave storage
 * empty and exercise the real default (French).
 */
function renderApp(hash = '#/', language: Language | null = 'en') {
  window.localStorage.clear();
  if (language) seedLanguage(language);
  window.location.hash = hash;
  return render(
    <AppStateProvider>
      <App />
    </AppStateProvider>,
  );
}

describe('App — smoke render of every route', () => {
  it('renders Home with both journey cards and the disclaimer', () => {
    renderApp('#/');
    expect(
      screen.getByRole('heading', {
        name: /Automated AI Use Case Admin Guide/i,
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Activate Agentforce Coworker/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Personalized AI Prompts/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/product names, menus, and feature availability/i)
        .length,
    ).toBeGreaterThan(0);
  });

  it('renders the Agentforce journey wizard', () => {
    renderApp('#/journey/agentforce');
    expect(
      screen.getByRole('heading', {
        name: /Activate Agentforce Coworker/i,
        level: 1,
      }),
    ).toBeInTheDocument();
    // progress bar present
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders the Prompts journey wizard with phase chrome', () => {
    renderApp('#/journey/prompts');
    expect(
      screen.getByRole('heading', {
        name: /Personalized AI Prompts/i,
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it('renders the Prompt Library grid', () => {
    renderApp('#/library');
    expect(
      screen.getByRole('heading', { name: /Prompt Library/i, level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Super Sales Prompt/i }),
    ).toBeInTheDocument();
  });

  it('renders a prompt detail with the customizer', () => {
    renderApp('#/library/account-summary-prompt');
    expect(
      screen.getByRole('heading', { name: /Customize this prompt/i }),
    ).toBeInTheDocument();
    // Object selector defaults to the prompt's object.
    expect(screen.getByLabelText(/Target object/i)).toBeInTheDocument();
  });

  it('renders the Troubleshooting assistant', () => {
    renderApp('#/troubleshoot');
    expect(
      screen.getByRole('heading', {
        name: /Troubleshooting assistant/i,
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/What's the symptom/i)).toBeInTheDocument();
  });

  it('renders the Validation dashboard with checks', () => {
    renderApp('#/validate/agentforce');
    expect(
      screen.getByRole('heading', { name: /^Validation$/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/checks verified/i)).toBeInTheDocument();
  });

  it('renders the Print view', () => {
    renderApp('#/print/prompts');
    expect(
      screen.getByRole('button', { name: /Print \/ Save as PDF/i }),
    ).toBeInTheDocument();
  });

  it('renders the Search page and finds results as you type', () => {
    renderApp('#/search?q=einstein');
    const input = screen.getByRole('searchbox', {
      name: /Search steps, prompts/i,
    });
    expect(input).toHaveValue('einstein');
    expect(screen.getByText(/results? for/i)).toBeInTheDocument();
  });
});

describe('App — interactions', () => {
  it('toggles between Beginner and Compact mode and persists it', async () => {
    renderApp('#/journey/agentforce');
    const compactBtn = screen.getByRole('button', { name: /^Compact$/i });
    fireEvent.click(compactBtn);
    expect(compactBtn).toHaveAttribute('aria-pressed', 'true');

    await waitFor(() => expect(readSaved()?.state.mode).toBe('compact'));
  });

  it('marks a step complete and reflects it in progress (persisted)', async () => {
    renderApp('#/journey/agentforce');
    const markButtons = screen.getAllByRole('button', { name: /Mark complete/i });
    expect(markButtons.length).toBeGreaterThan(0);
    fireEvent.click(markButtons[0]);
    // The button flips to "Completed".
    expect(
      screen.getAllByRole('button', { name: /Completed/i }).length,
    ).toBeGreaterThan(0);

    await waitFor(() => {
      const saved = readSaved();
      const doneCount = Object.values(
        saved?.state.progress.agentforce.steps ?? {},
      ).filter(Boolean).length;
      expect(doneCount).toBeGreaterThan(0);
    });
  });

  it('copies prompt text and shows "Copied!" feedback', async () => {
    renderApp('#/library');
    const copyButtons = screen.getAllByRole('button', { name: /Copy /i });
    expect(copyButtons.length).toBeGreaterThan(0);
    fireEvent.click(copyButtons[0]);
    // Feedback appears (execCommand stub returns true).
    expect(await screen.findByText(/Copied!/i)).toBeInTheDocument();
  });

  it('navigates Home → Library via the header nav', async () => {
    renderApp('#/');
    const primaryNav = screen.getByRole('navigation', { name: /Primary/i });
    fireEvent.click(within(primaryNav).getByRole('button', { name: /Library/i }));
    // Navigation fires an async hashchange in jsdom, so poll for the new page.
    expect(
      await screen.findByRole('heading', {
        name: /Prompt Library/i,
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it('records copy history in persisted state', async () => {
    renderApp('#/library');
    const copyButtons = screen.getAllByRole('button', { name: /Copy /i });
    fireEvent.click(copyButtons[0]);
    await waitFor(() =>
      expect(readSaved()?.state.copyHistory.length).toBeGreaterThan(0),
    );
  });
});

describe('i18n — French default and language switching', () => {
  it('defaults to French when no language is persisted', () => {
    // language = null → empty storage → real default (French).
    renderApp('#/', null);
    expect(
      screen.getByRole('heading', { name: UI.fr['home.h1'], level: 1 }),
    ).toBeInTheDocument();
    // The French mode toggle label is present…
    expect(
      screen.getByRole('button', { name: UI.fr['mode.beginner'] }),
    ).toBeInTheDocument();
    // …and <html lang> tracks the active language.
    expect(document.documentElement.lang).toBe('fr');
  });

  it('shows a language switcher with FR and EN options', () => {
    renderApp('#/', 'fr');
    const group = screen.getByRole('group', { name: UI.fr['lang.group'] });
    expect(
      within(group).getByRole('button', { name: 'FR' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(group).getByRole('button', { name: 'EN' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches the whole UI to English and persists the choice', async () => {
    renderApp('#/', 'fr');
    // French heading is showing first.
    expect(
      screen.getByRole('heading', { name: UI.fr['home.h1'], level: 1 }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));

    // UI chrome flips to English.
    expect(
      screen.getByRole('heading', { name: UI.en['home.h1'], level: 1 }),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');
    await waitFor(() => expect(readSaved()?.state.language).toBe('en'));
  });

  it('translates guide content (journey wizard) into French', () => {
    renderApp('#/journey/agentforce', 'fr');
    // The wizard chrome is localized (Home breadcrumb + Previous button).
    expect(
      screen.getByRole('button', { name: UI.fr['journey.previous'] }),
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

describe('i18n — dictionary integrity', () => {
  it('has identical key sets for English and French', () => {
    const enKeys = Object.keys(UI.en).sort();
    const frKeys = Object.keys(UI.fr).sort();
    expect(frKeys).toEqual(enKeys);
  });

  it('has no empty translations in either language', () => {
    for (const lang of ['en', 'fr'] as const) {
      for (const [key, value] of Object.entries(UI[lang])) {
        expect(value, `${lang}.${key} should be non-empty`).toBeTruthy();
      }
    }
  });

  it('preserves interpolation placeholders across languages', () => {
    const tokenRe = /\{(\w+)\}/g;
    const tokensOf = (s: string) =>
      [...s.matchAll(tokenRe)].map((m) => m[1]).sort();
    for (const key of Object.keys(UI.en) as (keyof typeof UI.en)[]) {
      expect(tokensOf(UI.fr[key]), `tokens differ for ${key}`).toEqual(
        tokensOf(UI.en[key]),
      );
    }
  });
});
