// ============================================================================
// Data aggregation + language-aware getters.
//
// English is the base content. French is produced at runtime by deep-merging
// sparse overlays (see lib/localize.ts) onto the English base. Localized
// bundles are cached per language so the merge + search-index build happen at
// most once per language, not on every render.
// ============================================================================

import type {
  Journey,
  JourneyId,
  Language,
  Prompt,
  SearchRecord,
  TroubleshootingEntry,
} from '../lib/types';
import { buildSearchIndex } from '../lib/search';
import {
  localizeJourney,
  localizePrompts,
  localizeRows,
  localizeTroubleshooting,
} from '../lib/localize';
import { agentforceJourney } from './agentforceSteps';
import { promptsJourney } from './promptSetupSteps';
import { prompts } from './promptLibrary';
import { troubleshooting } from './troubleshooting';
import {
  bestPractices,
  commonErrors,
  limits,
  limitsNote,
  type BestPractice,
  type CommonError,
  type LimitRow,
} from './quickReference';
import { agentforceOverlay } from './agentforceSteps.fr';
import { promptsOverlay } from './promptSetupSteps.fr';
import { troubleshootingOverlay } from './troubleshooting.fr';
import { quickReferenceOverlay } from './quickReference.fr';
import { promptLibraryOverlay } from './promptLibrary.fr';

// ---------------------------------------------------------------------------
// English base (also the default for tests and any non-localized code path).
// ---------------------------------------------------------------------------

export const journeys: Record<JourneyId, Journey> = {
  agentforce: agentforceJourney,
  prompts: promptsJourney,
};

export const journeyList: Journey[] = [agentforceJourney, promptsJourney];

export interface QuickReference {
  bestPractices: BestPractice[];
  commonErrors: CommonError[];
  limits: LimitRow[];
  limitsNote: string;
}

// ---------------------------------------------------------------------------
// Per-language localized bundle (built once, then cached).
// ---------------------------------------------------------------------------

interface LocalizedBundle {
  journeys: Record<JourneyId, Journey>;
  journeyList: Journey[];
  prompts: Prompt[];
  troubleshooting: TroubleshootingEntry[];
  quickReference: QuickReference;
  searchIndex: SearchRecord[];
}

function buildBundle(lang: Language): LocalizedBundle {
  if (lang === 'en') {
    return {
      journeys,
      journeyList,
      prompts,
      troubleshooting,
      quickReference: { bestPractices, commonErrors, limits, limitsNote },
      searchIndex: buildSearchIndex(journeyList, prompts, troubleshooting),
    };
  }

  // French — merge overlays onto the English base.
  const frAgentforce = localizeJourney(agentforceJourney, agentforceOverlay);
  const frPrompts = localizeJourney(promptsJourney, promptsOverlay);
  const frJourneyList = [frAgentforce, frPrompts];
  const frPromptList = localizePrompts(prompts, promptLibraryOverlay);
  const frTroubleshooting = localizeTroubleshooting(
    troubleshooting,
    troubleshootingOverlay,
  );

  return {
    journeys: { agentforce: frAgentforce, prompts: frPrompts },
    journeyList: frJourneyList,
    prompts: frPromptList,
    troubleshooting: frTroubleshooting,
    quickReference: {
      bestPractices: localizeRows(bestPractices, quickReferenceOverlay.bestPractices),
      commonErrors: localizeRows(commonErrors, quickReferenceOverlay.commonErrors),
      limits: localizeRows(limits, quickReferenceOverlay.limits),
      limitsNote: quickReferenceOverlay.limitsNote ?? limitsNote,
    },
    searchIndex: buildSearchIndex(frJourneyList, frPromptList, frTroubleshooting),
  };
}

const bundleCache = new Map<Language, LocalizedBundle>();

function bundle(lang: Language): LocalizedBundle {
  let cached = bundleCache.get(lang);
  if (!cached) {
    cached = buildBundle(lang);
    bundleCache.set(lang, cached);
  }
  return cached;
}

// ---------------------------------------------------------------------------
// Public language-aware getters.
// ---------------------------------------------------------------------------

export function getJourneys(lang: Language): Record<JourneyId, Journey> {
  return bundle(lang).journeys;
}

export function getJourneyList(lang: Language): Journey[] {
  return bundle(lang).journeyList;
}

export function getJourney(id: JourneyId, lang: Language): Journey {
  return bundle(lang).journeys[id];
}

export function getPrompts(lang: Language): Prompt[] {
  return bundle(lang).prompts;
}

export function getTroubleshooting(lang: Language): TroubleshootingEntry[] {
  return bundle(lang).troubleshooting;
}

export function getQuickReference(lang: Language): QuickReference {
  return bundle(lang).quickReference;
}

export function getSearchIndex(lang: Language): SearchRecord[] {
  return bundle(lang).searchIndex;
}

/** Static English search index — retained for back-compat and tests. */
export const searchIndex = bundle('en').searchIndex;

/** Flatten a journey's steps in section order (used by the wizard). */
export function flattenSteps(journey: Journey) {
  return journey.sections.flatMap((section) =>
    section.steps.map((step) => ({ section, step })),
  );
}

export { agentforceJourney, promptsJourney, prompts, troubleshooting };
