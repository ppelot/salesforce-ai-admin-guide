import { describe, expect, it } from 'vitest';
import {
  computeChecklistStatus,
  computeJourneyProgress,
  computeReadyForValidation,
} from './progress';
import type { Journey, JourneyProgress, Section, Step } from './types';

// --- fixture builders -------------------------------------------------------

function step(id: string, gating: Step['gating'] = 'required'): Step {
  return { id, order: 1, title: id, summary: '', gating };
}

function section(id: string, over: Partial<Section> = {}): Section {
  return { id, title: id, steps: [], checklist: [], ...over };
}

function journey(sections: Section[]): Journey {
  return {
    id: 'agentforce',
    title: 'Test',
    tagline: '',
    icon: 'bot',
    difficulty: 'Easy',
    includes: [],
    purpose: '',
    sections,
    validation: [],
  };
}

function progress(over: Partial<JourneyProgress> = {}): JourneyProgress {
  return { steps: {}, checks: {}, notes: {}, ...over };
}

// --- computeChecklistStatus -------------------------------------------------

describe('computeChecklistStatus', () => {
  it('is "go" for an empty checklist', () => {
    expect(computeChecklistStatus(section('s'), progress())).toBe('go');
  });

  it('gates on blocking items only', () => {
    const s = section('s', {
      checklist: [
        { id: 'b1', label: 'b1', blocking: true },
        { id: 'o1', label: 'o1', blocking: false },
      ],
    });
    expect(computeChecklistStatus(s, progress())).toBe('no-go');
    expect(
      computeChecklistStatus(s, progress({ checks: { b1: true } })),
    ).toBe('go');
  });

  it('is "partial" when some but not all blocking items are checked', () => {
    const s = section('s', {
      checklist: [
        { id: 'b1', label: 'b1', blocking: true },
        { id: 'b2', label: 'b2', blocking: true },
      ],
    });
    expect(
      computeChecklistStatus(s, progress({ checks: { b1: true } })),
    ).toBe('partial');
  });

  it('with no blocking items, requires all items checked for "go"', () => {
    const s = section('s', {
      checklist: [
        { id: 'o1', label: 'o1', blocking: false },
        { id: 'o2', label: 'o2', blocking: false },
      ],
    });
    expect(computeChecklistStatus(s, progress())).toBe('no-go');
    expect(
      computeChecklistStatus(s, progress({ checks: { o1: true } })),
    ).toBe('partial');
    expect(
      computeChecklistStatus(s, progress({ checks: { o1: true, o2: true } })),
    ).toBe('go');
  });
});

// --- computeJourneyProgress -------------------------------------------------

describe('computeJourneyProgress', () => {
  it('counts only gating (non-optional) steps toward totals', () => {
    const j = journey([
      section('s1', { steps: [step('a'), step('b'), step('c', 'optional')] }),
    ]);
    const summary = computeJourneyProgress(j, progress({ steps: { a: true } }));
    expect(summary.totalSteps).toBe(2); // c is optional, excluded
    expect(summary.completedSteps).toBe(1);
    expect(summary.percent).toBe(50);
  });

  it('rolls up percent across sections', () => {
    const j = journey([
      section('s1', { steps: [step('a'), step('b')] }),
      section('s2', { steps: [step('c'), step('d')] }),
    ]);
    const summary = computeJourneyProgress(
      j,
      progress({ steps: { a: true, b: true, c: true } }),
    );
    expect(summary.totalSteps).toBe(4);
    expect(summary.completedSteps).toBe(3);
    expect(summary.percent).toBe(75);
    expect(summary.perSection[0].percent).toBe(100);
    expect(summary.perSection[1].percent).toBe(50);
  });

  it('surfaces open warnings from incomplete steps and clears them when done', () => {
    const warned = step('a');
    warned.warnings = [
      { id: 'w1', level: 'warning', title: 'Careful', body: '...' },
    ];
    const j = journey([section('s1', { steps: [warned, step('b')] })]);

    const open = computeJourneyProgress(j, progress());
    expect(open.openWarnings).toHaveLength(1);
    expect(open.openWarnings[0].warning.id).toBe('w1');
    expect(open.openWarnings[0].stepId).toBe('a');

    const cleared = computeJourneyProgress(j, progress({ steps: { a: true } }));
    expect(cleared.openWarnings).toHaveLength(0);
  });

  it('ignores info/tip level callouts as open warnings', () => {
    const s = step('a');
    s.warnings = [{ id: 'i1', level: 'info', title: 'FYI', body: '...' }];
    const j = journey([section('s1', { steps: [s] })]);
    expect(computeJourneyProgress(j, progress()).openWarnings).toHaveLength(0);
  });
});

// --- computeReadyForValidation ----------------------------------------------

describe('computeReadyForValidation', () => {
  const j = journey([
    section('s1', {
      steps: [step('a'), step('b'), step('c', 'optional')],
      checklist: [{ id: 'chk', label: 'chk', blocking: true }],
    }),
  ]);

  it('is false until all gating steps AND blocking checks pass', () => {
    expect(computeReadyForValidation(j, progress())).toBe(false);
    expect(
      computeReadyForValidation(j, progress({ steps: { a: true, b: true } })),
    ).toBe(false); // blocking check still unchecked
  });

  it('is true when gating steps done and blocking checks checked (optional ignored)', () => {
    expect(
      computeReadyForValidation(
        j,
        progress({ steps: { a: true, b: true }, checks: { chk: true } }),
      ),
    ).toBe(true);
  });
});
