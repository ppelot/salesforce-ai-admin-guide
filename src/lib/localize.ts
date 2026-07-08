// ============================================================================
// Language overlays + pure merge engine.
//
// French content is authored as sparse "overlays" keyed by the SAME ids as the
// English source data. At runtime we deep-merge an overlay onto the English
// base. Anything the overlay omits falls through from English — which is
// exactly how Salesforce literals (Setup navigation paths, Quick Find terms,
// API / permission-set names, copy-block VALUES, prompt bodies, literal field
// values) stay in English: the French overlay simply never mentions them.
//
// These functions are pure and dependency-free (no data imports) so they are
// unit-testable and reusable for any future locale.
// ============================================================================

import type {
  ChecklistItem,
  Journey,
  Prompt,
  Section,
  Step,
  TroubleshootingEntry,
  ValueRow,
  Warning,
} from './types';

// ---------------------------------------------------------------------------
// Overlay shapes — only the human-readable, translatable fields.
// ---------------------------------------------------------------------------

/** Translated title/body for a warning, keyed by the warning's id. */
export interface WarningOverlay {
  title?: string;
  body?: string;
}

/**
 * Translated pieces of a Step. Arrays:
 *  - `instructions` is a FULL French replacement (same order as English).
 *  - `valuesToEnter` is applied BY INDEX; each row may override `field` and/or
 *    `value`. Omit `value` to keep the English literal (e.g. "Account",
 *    "Daily", an API name). `copyBlocks` maps a copy-block id -> its French
 *    LABEL only (the copied value is always the English literal).
 */
export interface StepOverlay {
  title?: string;
  summary?: string;
  compactLabel?: string;
  instructions?: string[];
  valuesToEnter?: Array<{ field?: string; value?: string }>;
  whyItMatters?: string;
  beginnerTip?: string;
  passCriteria?: string;
  warnings?: Record<string, WarningOverlay>;
  copyBlocks?: Record<string, string>;
}

/** Translated pieces of a Section, plus its steps/warnings/checklist. */
export interface SectionOverlay {
  title?: string;
  intro?: string;
  doneWhen?: string;
  warnings?: Record<string, WarningOverlay>;
  /** Keyed by step id. */
  steps?: Record<string, StepOverlay>;
  /** Keyed by checklist item id -> French label. */
  checklist?: Record<string, string>;
}

/** Translated pieces of a whole Journey. */
export interface JourneyOverlay {
  title?: string;
  tagline?: string;
  purpose?: string;
  difficulty?: string;
  /** Full French replacement of the "includes" chips (same order). */
  includes?: string[];
  /** Keyed by section id. */
  sections?: Record<string, SectionOverlay>;
  /** Keyed by validation-check id. */
  validation?: Record<string, { label?: string; how?: string }>;
}

/** Translatable prompt-card fields. Body + tags + object stay English. */
export interface PromptOverlay {
  title?: string;
  description?: string;
  outputFormat?: string;
}

/** Translatable troubleshooting fields (keep literal API names inside them). */
export interface TroubleshootingOverlay {
  symptom?: string;
  cause?: string;
  fix?: string;
}

/** Quick-reference tables. Arrays are applied BY INDEX. */
export interface QuickRefOverlay {
  bestPractices?: Array<{ practice?: string; why?: string }>;
  commonErrors?: Array<{ error?: string; cause?: string; fix?: string }>;
  limits?: Array<{ limit?: string; value?: string }>;
  limitsNote?: string;
}

// ---------------------------------------------------------------------------
// Merge helpers (immutable — always return new objects).
// ---------------------------------------------------------------------------

function mergeWarnings(
  base: Warning[] | undefined,
  ov?: Record<string, WarningOverlay>,
): Warning[] | undefined {
  if (!base || !ov) return base;
  return base.map((w) => {
    const o = ov[w.id];
    return o ? { ...w, title: o.title ?? w.title, body: o.body ?? w.body } : w;
  });
}

function mergeValues(
  base: ValueRow[] | undefined,
  ov?: Array<{ field?: string; value?: string }>,
): ValueRow[] | undefined {
  if (!base || !ov) return base;
  return base.map((r, i) => {
    const o = ov[i];
    return o ? { ...r, field: o.field ?? r.field, value: o.value ?? r.value } : r;
  });
}

function mergeCopyBlockLabels(
  base: Step['copyBlocks'],
  ov?: Record<string, string>,
): Step['copyBlocks'] {
  if (!base || !ov) return base;
  return base.map((cb) => (ov[cb.id] ? { ...cb, label: ov[cb.id] } : cb));
}

function mergeChecklist(
  base: ChecklistItem[],
  ov?: Record<string, string>,
): ChecklistItem[] {
  if (!ov) return base;
  return base.map((c) => (ov[c.id] ? { ...c, label: ov[c.id] } : c));
}

function mergeStep(base: Step, ov?: StepOverlay): Step {
  if (!ov) return base;
  return {
    ...base,
    title: ov.title ?? base.title,
    summary: ov.summary ?? base.summary,
    compactLabel: ov.compactLabel ?? base.compactLabel,
    instructions: ov.instructions ?? base.instructions,
    valuesToEnter: mergeValues(base.valuesToEnter, ov.valuesToEnter),
    whyItMatters: ov.whyItMatters ?? base.whyItMatters,
    beginnerTip: ov.beginnerTip ?? base.beginnerTip,
    passCriteria: ov.passCriteria ?? base.passCriteria,
    warnings: mergeWarnings(base.warnings, ov.warnings),
    copyBlocks: mergeCopyBlockLabels(base.copyBlocks, ov.copyBlocks),
  };
}

function mergeSection(base: Section, ov?: SectionOverlay): Section {
  if (!ov) return base;
  return {
    ...base,
    title: ov.title ?? base.title,
    intro: ov.intro ?? base.intro,
    doneWhen: ov.doneWhen ?? base.doneWhen,
    warnings: mergeWarnings(base.warnings, ov.warnings),
    steps: base.steps.map((s) => mergeStep(s, ov.steps?.[s.id])),
    checklist: mergeChecklist(base.checklist, ov.checklist),
  };
}

// ---------------------------------------------------------------------------
// Public localizers.
// ---------------------------------------------------------------------------

export function localizeJourney(base: Journey, ov?: JourneyOverlay): Journey {
  if (!ov) return base;
  return {
    ...base,
    title: ov.title ?? base.title,
    tagline: ov.tagline ?? base.tagline,
    purpose: ov.purpose ?? base.purpose,
    difficulty: ov.difficulty ?? base.difficulty,
    includes: ov.includes ?? base.includes,
    sections: base.sections.map((s) => mergeSection(s, ov.sections?.[s.id])),
    validation: base.validation.map((v) => {
      const o = ov.validation?.[v.id];
      return o ? { ...v, label: o.label ?? v.label, how: o.how ?? v.how } : v;
    }),
  };
}

export function localizePrompts(
  base: Prompt[],
  ov?: Record<string, PromptOverlay>,
): Prompt[] {
  if (!ov) return base;
  return base.map((p) => {
    const o = ov[p.id];
    return o
      ? {
          ...p,
          title: o.title ?? p.title,
          description: o.description ?? p.description,
          outputFormat: o.outputFormat ?? p.outputFormat,
        }
      : p;
  });
}

export function localizeTroubleshooting(
  base: TroubleshootingEntry[],
  ov?: Record<string, TroubleshootingOverlay>,
): TroubleshootingEntry[] {
  if (!ov) return base;
  return base.map((e) => {
    const o = ov[e.id];
    return o
      ? {
          ...e,
          symptom: o.symptom ?? e.symptom,
          cause: o.cause ?? e.cause,
          fix: o.fix ?? e.fix,
        }
      : e;
  });
}

/** Generic BY-INDEX row merge for the quick-reference tables. */
export function localizeRows<T extends object>(
  base: T[],
  ov?: Array<Partial<T>>,
): T[] {
  if (!ov) return base;
  return base.map((row, i) => (ov[i] ? { ...row, ...ov[i] } : row));
}
