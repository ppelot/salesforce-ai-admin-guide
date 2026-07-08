// ============================================================================
// Shared type definitions for the whole app.
// Split into: Domain (static guide data) · Prompt library · Troubleshooting ·
// Search · Routing · Persisted state · Derived selectors.
// ============================================================================

// ---------------------------------------------------------------------------
// Domain — the static guide content (both journeys share this shape).
// ---------------------------------------------------------------------------

export type JourneyId = 'agentforce' | 'prompts';

/** How important a step is. Drives its badge and whether it gates readiness. */
export type StepGating = 'required' | 'recommended' | 'optional';

/** A Salesforce Setup navigation path, shown as a breadcrumb. */
export interface NavPath {
  /** e.g. ["Setup", "Object Manager", "Account", "Fields & Relationships"] */
  segments: string[];
  /** Optional Quick Find term to type in Setup search. */
  quickFind?: string;
}

export type CopyBlockKind =
  | 'apiName'
  | 'promptText'
  | 'json'
  | 'flowRef'
  | 'value'
  | 'code';

/** A copyable snippet: API name, prompt text, JSON input, flow reference, etc. */
export interface CopyBlock {
  id: string;
  label: string;
  value: string;
  kind: CopyBlockKind;
}

export type WarningLevel = 'info' | 'tip' | 'blocker' | 'warning';

/** A callout attached to a step or section (warning, blocker, tip, note). */
export interface Warning {
  id: string;
  level: WarningLevel;
  title: string;
  body: string;
}

/** A single field/value row to enter in a Setup screen. */
export interface ValueRow {
  field: string;
  value: string;
  /** When true, render the value with a copy button. */
  copyable?: boolean;
}

/** One checklist item within a section. Blocking items gate "ready". */
export interface ChecklistItem {
  id: string;
  label: string;
  blocking: boolean;
  helpText?: string;
}

/** A single guided step. */
export interface Step {
  id: string;
  order: number;
  title: string;
  /** Plain-English explanation of what this step accomplishes. */
  summary: string;
  navPath?: NavPath;
  /** Numbered click-by-click instructions. */
  instructions?: string[];
  valuesToEnter?: ValueRow[];
  whyItMatters?: string;
  beginnerTip?: string;
  /** Success/pass criteria for this step, if any. */
  passCriteria?: string;
  warnings?: Warning[];
  copyBlocks?: CopyBlock[];
  gating: StepGating;
  /** Short label used in compact mode instead of the full card. */
  compactLabel?: string;
}

/** A section (Journey 1) or phase (Journey 2). Same shape either way. */
export interface Section {
  id: string;
  title: string;
  intro?: string;
  /** Set only for Journey-2 phases; drives "Phase N" chrome. */
  phaseNumber?: number;
  /** "Done when…" summary for a phase. */
  doneWhen?: string;
  steps: Step[];
  checklist: ChecklistItem[];
  warnings?: Warning[];
}

/** A final validation check shown on the ValidationDashboard. */
export interface ValidationCheck {
  id: string;
  label: string;
  how: string;
  relatedStepId?: string;
}

/** A whole journey. */
export interface Journey {
  id: JourneyId;
  title: string;
  tagline: string;
  /** lucide icon name resolved via icons.ts (kept as a string so data is JSX-free). */
  icon: string;
  difficulty: string;
  includes: string[];
  purpose: string;
  sections: Section[];
  validation: ValidationCheck[];
}

// ---------------------------------------------------------------------------
// Prompt library
// ---------------------------------------------------------------------------

export type PromptTag =
  | 'Sales'
  | 'Opportunity'
  | 'Prospecting Email'
  | 'Meeting Preparation'
  | 'Pipeline Health'
  | 'White Space / Upsell'
  | 'Lead Qualification'
  | 'Activity Capture'
  | 'Account';

export type Tone = 'concise' | 'executive' | 'beginner-friendly' | 'persuasive';
export type OutputType = 'html' | 'plain';
export type PromptObject = 'Account' | 'Opportunity' | 'Lead' | 'Contact';

export interface Prompt {
  id: string;
  title: string;
  /** One-line use case description. */
  description: string;
  tags: PromptTag[];
  /** Salesforce object / data the prompt targets. */
  object: PromptObject;
  /** Required grounding data descriptions (for the card). */
  grounding: string[];
  /** Output format description (for the card). */
  outputFormat: string;
  /** The full prompt text. Contains {!$...} Salesforce tokens (immutable). */
  body: string;
}

/** Options collected by the PromptCustomizer form. */
export interface CustomizeOptions {
  object: PromptObject;
  language: string;
  tone: Tone;
  wordLimit: number | null;
  outputType: OutputType;
}

// ---------------------------------------------------------------------------
// Troubleshooting
// ---------------------------------------------------------------------------

export interface TroubleshootingEntry {
  id: string;
  journeyId: JourneyId | 'both';
  symptom: string;
  cause: string;
  fix: string;
  relatedStepId?: string;
  tags?: string[];
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export type SearchRecordType =
  | 'step'
  | 'prompt'
  | 'troubleshooting'
  | 'navPath'
  | 'apiName'
  | 'section';

export interface SearchRecord {
  id: string;
  type: SearchRecordType;
  title: string;
  breadcrumb: string;
  /** Pre-lowercased searchable text. */
  haystack: string;
  route: Route;
}

export interface SearchHit {
  record: SearchRecord;
  score: number;
}

export interface HighlightSegment {
  text: string;
  match: boolean;
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

export type Route =
  | { kind: 'home' }
  | { kind: 'journey'; journeyId: JourneyId; sectionId?: string }
  | { kind: 'library'; promptId?: string }
  | { kind: 'troubleshoot'; symptomId?: string }
  | { kind: 'validate'; journeyId: JourneyId }
  | { kind: 'search'; q: string }
  | { kind: 'print'; journeyId: JourneyId }
  | { kind: 'guide' };

// ---------------------------------------------------------------------------
// Persisted state
// ---------------------------------------------------------------------------

export type AdminMode = 'beginner' | 'compact';

/** UI + content language. French is the default. */
export type Language = 'fr' | 'en';

export interface CopyEvent {
  id: string;
  at: number;
  label: string;
  value: string;
  kind: CopyBlockKind;
}

export interface JourneyProgress {
  /** stepId -> completed */
  steps: Record<string, boolean>;
  /** checklistItemId (and validation check id) -> checked */
  checks: Record<string, boolean>;
  /** stepId -> free-text note */
  notes: Record<string, string>;
}

export interface AppState {
  mode: AdminMode;
  /** UI + content language. Defaults to French. */
  language: Language;
  selectedJourney: JourneyId | null;
  progress: Record<JourneyId, JourneyProgress>;
  /** Most-recent copied snippets (capped). */
  copyHistory: CopyEvent[];
}

export interface PersistEnvelope {
  schemaVersion: number;
  state: AppState;
}

// ---------------------------------------------------------------------------
// Derived (selector outputs)
// ---------------------------------------------------------------------------

export type GoNoGo = 'go' | 'partial' | 'no-go';

export interface SectionProgressSummary {
  sectionId: string;
  title: string;
  phaseNumber?: number;
  total: number;
  completed: number;
  percent: number;
  goNoGo: GoNoGo;
}

export interface WarningRef {
  warning: Warning;
  sectionId: string;
  sectionTitle: string;
  stepId?: string;
}

export interface JourneyProgressSummary {
  journeyId: JourneyId;
  totalSteps: number;
  completedSteps: number;
  percent: number;
  perSection: SectionProgressSummary[];
  openWarnings: WarningRef[];
  readyForValidation: boolean;
}
