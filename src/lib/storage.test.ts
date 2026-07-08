import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  STORAGE_KEY,
  clearAll,
  clearJourney,
  defaultState,
  isAppState,
  loadState,
  saveState,
} from './storage';
import type { AppState } from './types';

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(() => {
  window.localStorage.clear();
});

describe('defaultState', () => {
  it('produces a valid, empty state', () => {
    const s = defaultState();
    expect(isAppState(s)).toBe(true);
    expect(s.mode).toBe('beginner');
    expect(s.selectedJourney).toBeNull();
    expect(s.copyHistory).toEqual([]);
    expect(s.progress.agentforce).toEqual({ steps: {}, checks: {}, notes: {} });
    expect(s.progress.prompts).toEqual({ steps: {}, checks: {}, notes: {} });
  });
});

describe('isAppState', () => {
  it('accepts a well-formed state', () => {
    expect(isAppState(defaultState())).toBe(true);
  });

  it('rejects malformed values', () => {
    expect(isAppState(null)).toBe(false);
    expect(isAppState({})).toBe(false);
    expect(isAppState({ mode: 'nope' })).toBe(false);
    expect(
      isAppState({ ...defaultState(), progress: { agentforce: {} } }),
    ).toBe(false);
    expect(isAppState({ ...defaultState(), copyHistory: 'x' })).toBe(false);
  });

  it('rejects a bad selectedJourney but accepts null / valid ids', () => {
    expect(isAppState({ ...defaultState(), selectedJourney: 'bogus' })).toBe(
      false,
    );
    expect(isAppState({ ...defaultState(), selectedJourney: 'prompts' })).toBe(
      true,
    );
  });
});

describe('saveState / loadState round-trip', () => {
  it('persists and restores state via the versioned envelope', () => {
    const s = defaultState();
    s.mode = 'compact';
    s.progress.agentforce.steps['af-t-step1'] = true;
    s.progress.prompts.notes['p1-create-field'] = 'use Rich Text';

    expect(saveState(s)).toBe(true);

    // Envelope shape on disk.
    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string);
    expect(parsed.schemaVersion).toBe(1);

    const loaded = loadState();
    expect(loaded.mode).toBe('compact');
    expect(loaded.progress.agentforce.steps['af-t-step1']).toBe(true);
    expect(loaded.progress.prompts.notes['p1-create-field']).toBe(
      'use Rich Text',
    );
  });

  it('returns defaultState when storage is empty', () => {
    expect(loadState()).toEqual(defaultState());
  });

  it('falls back to defaultState on corrupt JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not valid json');
    expect(loadState()).toEqual(defaultState());
  });

  it('falls back to defaultState on a foreign / invalid envelope', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, state: { mode: 'bad' } }),
    );
    expect(loadState()).toEqual(defaultState());
  });

  it('backfills a missing journey sub-object', () => {
    const partial = {
      schemaVersion: 1,
      state: {
        mode: 'beginner',
        selectedJourney: null,
        progress: {
          agentforce: { steps: { x: true }, checks: {}, notes: {} },
          prompts: { steps: {}, checks: {}, notes: {} },
        },
        copyHistory: [],
      },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(partial));
    const loaded = loadState();
    expect(loaded.progress.agentforce.steps.x).toBe(true);
    expect(loaded.progress.prompts).toEqual({ steps: {}, checks: {}, notes: {} });
  });
});

describe('clearJourney / clearAll', () => {
  it('clearJourney resets only the target journey (pure)', () => {
    const s: AppState = defaultState();
    s.progress.agentforce.steps['a'] = true;
    s.progress.prompts.steps['b'] = true;

    const next = clearJourney(s, 'agentforce');
    expect(next.progress.agentforce.steps).toEqual({});
    expect(next.progress.prompts.steps).toEqual({ b: true });
    // original is not mutated
    expect(s.progress.agentforce.steps['a']).toBe(true);
  });

  it('clearAll wipes storage and returns a fresh default', () => {
    saveState({ ...defaultState(), mode: 'compact' });
    const fresh = clearAll();
    expect(fresh).toEqual(defaultState());
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
