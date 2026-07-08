// ============================================================================
// localStorage persistence — a single versioned envelope with defensive guards.
// Every read is validated; any failure falls back to a fresh default state so a
// corrupt or foreign value can never crash the app. Works in-memory when
// storage is unavailable (Safari private mode, file://, disabled cookies).
// ============================================================================

import type {
  AppState,
  JourneyId,
  JourneyProgress,
  PersistEnvelope,
} from './types';

export const STORAGE_KEY = 'sf-journeys:v1';
export const SCHEMA_VERSION = 1;
const COPY_HISTORY_CAP = 50;

const JOURNEY_IDS: JourneyId[] = ['agentforce', 'prompts'];

function emptyJourneyProgress(): JourneyProgress {
  return { steps: {}, checks: {}, notes: {} };
}

export function defaultState(): AppState {
  return {
    mode: 'beginner',
    language: 'fr',
    selectedJourney: null,
    progress: {
      agentforce: emptyJourneyProgress(),
      prompts: emptyJourneyProgress(),
    },
    copyHistory: [],
  };
}

/** Probe whether localStorage can actually be written (some browsers throw). */
export function isStorageAvailable(): boolean {
  try {
    const probe = '__sfjourneys_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Type guards — never trust the parsed JSON.
// ---------------------------------------------------------------------------

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isBoolMap(v: unknown): v is Record<string, boolean> {
  if (!isRecord(v)) return false;
  return Object.values(v).every((x) => typeof x === 'boolean');
}

function isStringMap(v: unknown): v is Record<string, string> {
  if (!isRecord(v)) return false;
  return Object.values(v).every((x) => typeof x === 'string');
}

function isJourneyProgress(v: unknown): v is JourneyProgress {
  return (
    isRecord(v) &&
    isBoolMap(v.steps) &&
    isBoolMap(v.checks) &&
    isStringMap(v.notes)
  );
}

export function isAppState(v: unknown): v is AppState {
  if (!isRecord(v)) return false;
  if (v.mode !== 'beginner' && v.mode !== 'compact') return false;
  // Language is optional for backward-compat: absent = older save, normalize()
  // backfills it. Only reject if present AND invalid.
  if (v.language !== undefined && v.language !== 'fr' && v.language !== 'en') {
    return false;
  }
  if (
    v.selectedJourney !== null &&
    v.selectedJourney !== 'agentforce' &&
    v.selectedJourney !== 'prompts'
  ) {
    return false;
  }
  if (!isRecord(v.progress)) return false;
  for (const id of JOURNEY_IDS) {
    if (!isJourneyProgress(v.progress[id])) return false;
  }
  if (!Array.isArray(v.copyHistory)) return false;
  return true;
}

/** Fill in any missing top-level pieces so a partially-valid state still loads. */
function normalize(state: AppState): AppState {
  const base = defaultState();
  const next: AppState = {
    mode: state.mode ?? base.mode,
    language:
      state.language === 'en' || state.language === 'fr'
        ? state.language
        : base.language,
    selectedJourney: state.selectedJourney ?? null,
    progress: { ...base.progress },
    copyHistory: Array.isArray(state.copyHistory)
      ? state.copyHistory.slice(0, COPY_HISTORY_CAP)
      : [],
  };
  for (const id of JOURNEY_IDS) {
    const p = state.progress?.[id];
    next.progress[id] = isJourneyProgress(p) ? p : emptyJourneyProgress();
  }
  return next;
}

// ---------------------------------------------------------------------------
// Migrations — run in order for each version below SCHEMA_VERSION.
// Add entry `n` to migrate a v(n) envelope's state to v(n+1).
// ---------------------------------------------------------------------------

export const migrations: Record<number, (prevState: unknown) => unknown> = {
  // 1: (prevState) => ({ ...prevState as object, newField: ... }),
};

function runMigrations(fromVersion: number, state: unknown): unknown {
  let version = fromVersion;
  let current = state;
  while (version < SCHEMA_VERSION) {
    const migrate = migrations[version];
    if (!migrate) break;
    current = migrate(current);
    version += 1;
  }
  return current;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function loadState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || typeof parsed.schemaVersion !== 'number') {
      return defaultState();
    }

    const migrated = runMigrations(parsed.schemaVersion, parsed.state);
    if (!isAppState(migrated)) return defaultState();

    return normalize(migrated);
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): boolean {
  try {
    const envelope: PersistEnvelope = {
      schemaVersion: SCHEMA_VERSION,
      state: {
        ...state,
        copyHistory: state.copyHistory.slice(0, COPY_HISTORY_CAP),
      },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    return true;
  } catch {
    // Quota exceeded, private mode, etc. — keep running from memory.
    return false;
  }
}

/** Pure helper: return a copy of state with one journey's progress reset. */
export function clearJourney(state: AppState, journeyId: JourneyId): AppState {
  return {
    ...state,
    progress: {
      ...state.progress,
      [journeyId]: emptyJourneyProgress(),
    },
  };
}

/** Wipe everything and return a fresh default state. */
export function clearAll(): AppState {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return defaultState();
}

/** Subscribe to cross-tab changes on our key. Returns an unsubscribe fn. */
export function subscribeToStorage(cb: (s: AppState) => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cb(loadState());
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
