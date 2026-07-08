// ============================================================================
// Tiny hash-based router. Hash routing works under dev, `vite preview`, any
// static host, and file:// with zero server rewrites — the key to offline use.
// parseHash/buildHash are pure and unit-testable; useRoute subscribes to
// `hashchange` via useSyncExternalStore.
// ============================================================================

import { useCallback, useSyncExternalStore } from 'react';
import type { JourneyId, Route } from './types';

function isJourneyId(v: string): v is JourneyId {
  return v === 'agentforce' || v === 'prompts';
}

/** Parse `location.hash` into a Route. Never throws; unknown -> home. */
export function parseHash(hash: string): Route {
  // Strip leading "#": "#/journey/agentforce/s/x" -> "/journey/agentforce/s/x"
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);

  if (parts.length === 0) return { kind: 'home' };

  switch (parts[0]) {
    case 'journey': {
      if (parts[1] && isJourneyId(parts[1])) {
        // /journey/:id            or  /journey/:id/s/:sectionId
        const sectionId = parts[2] === 's' ? parts[3] : undefined;
        return { kind: 'journey', journeyId: parts[1], sectionId };
      }
      return { kind: 'home' };
    }
    case 'library':
      return { kind: 'library', promptId: parts[1] };
    case 'troubleshoot':
      return { kind: 'troubleshoot', symptomId: parts[1] };
    case 'validate': {
      if (parts[1] && isJourneyId(parts[1])) {
        return { kind: 'validate', journeyId: parts[1] };
      }
      return { kind: 'home' };
    }
    case 'print': {
      if (parts[1] && isJourneyId(parts[1])) {
        return { kind: 'print', journeyId: parts[1] };
      }
      return { kind: 'home' };
    }
    case 'search': {
      const params = new URLSearchParams(query);
      return { kind: 'search', q: params.get('q') ?? '' };
    }
    case 'guide':
      return { kind: 'guide' };
    default:
      return { kind: 'home' };
  }
}

/** Build a hash string (including leading "#") from a Route. */
export function buildHash(route: Route): string {
  switch (route.kind) {
    case 'home':
      return '#/';
    case 'journey':
      return route.sectionId
        ? `#/journey/${route.journeyId}/s/${encodeURIComponent(route.sectionId)}`
        : `#/journey/${route.journeyId}`;
    case 'library':
      return route.promptId
        ? `#/library/${encodeURIComponent(route.promptId)}`
        : '#/library';
    case 'troubleshoot':
      return route.symptomId
        ? `#/troubleshoot/${encodeURIComponent(route.symptomId)}`
        : '#/troubleshoot';
    case 'validate':
      return `#/validate/${route.journeyId}`;
    case 'print':
      return `#/print/${route.journeyId}`;
    case 'search':
      return `#/search?q=${encodeURIComponent(route.q)}`;
    case 'guide':
      return '#/guide';
  }
}

// --- external store wiring -------------------------------------------------

function subscribe(callback: () => void): () => void {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

function getSnapshot(): string {
  return window.location.hash || '#/';
}

/** Navigate imperatively. The browser records history so back/forward work. */
export function navigate(route: Route): void {
  window.location.hash = buildHash(route);
}

export function useRoute(): { route: Route; navigate: (r: Route) => void } {
  const hash = useSyncExternalStore(subscribe, getSnapshot, () => '#/');
  const nav = useCallback((r: Route) => navigate(r), []);
  return { route: parseHash(hash), navigate: nav };
}
