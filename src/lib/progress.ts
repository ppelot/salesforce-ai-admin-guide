// ============================================================================
// Pure progress selectors. No React, no storage — trivially unit-testable.
// Derives percent complete, per-section go/no-go, open warnings, and the
// "ready for validation?" gate from a Journey definition + its saved progress.
// ============================================================================

import type {
  GoNoGo,
  Journey,
  JourneyProgress,
  JourneyProgressSummary,
  Section,
  SectionProgressSummary,
  Step,
  WarningRef,
} from './types';

/** Steps that count toward completion/readiness (optional steps don't gate). */
function isGatingStep(step: Step): boolean {
  return step.gating !== 'optional';
}

function pct(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

function isStepDone(prog: JourneyProgress, stepId: string): boolean {
  return prog.steps[stepId] === true;
}

function isCheckDone(prog: JourneyProgress, checkId: string): boolean {
  return prog.checks[checkId] === true;
}

/** go = all blocking items checked; no-go = none checked; else partial. */
export function computeChecklistStatus(
  section: Section,
  prog: JourneyProgress,
): GoNoGo {
  const blocking = section.checklist.filter((c) => c.blocking);
  if (blocking.length === 0) {
    // No blocking items: treat as "go" only once every item is checked,
    // otherwise reflect partial/none from the full list.
    const all = section.checklist;
    if (all.length === 0) return 'go';
    const checked = all.filter((c) => isCheckDone(prog, c.id)).length;
    if (checked === 0) return 'no-go';
    return checked === all.length ? 'go' : 'partial';
  }
  const checked = blocking.filter((c) => isCheckDone(prog, c.id)).length;
  if (checked === 0) return 'no-go';
  return checked === blocking.length ? 'go' : 'partial';
}

function summarizeSection(
  section: Section,
  prog: JourneyProgress,
): SectionProgressSummary {
  const gatingSteps = section.steps.filter(isGatingStep);
  const total = gatingSteps.length;
  const completed = gatingSteps.filter((s) => isStepDone(prog, s.id)).length;
  return {
    sectionId: section.id,
    title: section.title,
    phaseNumber: section.phaseNumber,
    total,
    completed,
    percent: pct(completed, total),
    goNoGo: computeChecklistStatus(section, prog),
  };
}

/** Collect warnings/blockers from steps and sections that aren't yet complete. */
function collectOpenWarnings(
  journey: Journey,
  prog: JourneyProgress,
): WarningRef[] {
  const refs: WarningRef[] = [];
  for (const section of journey.sections) {
    // Section-level warnings stay open until the section's steps are all done.
    const sectionDone = section.steps
      .filter(isGatingStep)
      .every((s) => isStepDone(prog, s.id));
    for (const w of section.warnings ?? []) {
      if (!sectionDone && (w.level === 'warning' || w.level === 'blocker')) {
        refs.push({
          warning: w,
          sectionId: section.id,
          sectionTitle: section.title,
        });
      }
    }
    // Step-level warnings clear once that step is marked complete.
    for (const step of section.steps) {
      if (isStepDone(prog, step.id)) continue;
      for (const w of step.warnings ?? []) {
        if (w.level === 'warning' || w.level === 'blocker') {
          refs.push({
            warning: w,
            sectionId: section.id,
            sectionTitle: section.title,
            stepId: step.id,
          });
        }
      }
    }
  }
  return refs;
}

/** All non-optional steps complete AND every blocking checklist item checked. */
export function computeReadyForValidation(
  journey: Journey,
  prog: JourneyProgress,
): boolean {
  for (const section of journey.sections) {
    for (const step of section.steps) {
      if (isGatingStep(step) && !isStepDone(prog, step.id)) return false;
    }
    for (const item of section.checklist) {
      if (item.blocking && !isCheckDone(prog, item.id)) return false;
    }
  }
  return true;
}

export function computeJourneyProgress(
  journey: Journey,
  prog: JourneyProgress,
): JourneyProgressSummary {
  const perSection = journey.sections.map((s) => summarizeSection(s, prog));
  const totalSteps = perSection.reduce((n, s) => n + s.total, 0);
  const completedSteps = perSection.reduce((n, s) => n + s.completed, 0);
  return {
    journeyId: journey.id,
    totalSteps,
    completedSteps,
    percent: pct(completedSteps, totalSteps),
    perSection,
    openWarnings: collectOpenWarnings(journey, prog),
    readyForValidation: computeReadyForValidation(journey, prog),
  };
}
