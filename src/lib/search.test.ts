import { describe, expect, it } from 'vitest';
import { buildSearchIndex, highlight, search } from './search';
import type { Journey, Prompt, TroubleshootingEntry } from './types';

const journey: Journey = {
  id: 'agentforce',
  title: 'Activate Agentforce Coworker',
  tagline: '',
  icon: 'bot',
  difficulty: 'Medium',
  includes: [],
  purpose: '',
  sections: [
    {
      id: 'sec1',
      title: 'Prerequisites',
      intro: 'Enable Einstein first',
      steps: [
        {
          id: 'step1',
          order: 1,
          title: 'Enable Einstein',
          summary: 'Turn on Einstein AI in Setup.',
          gating: 'required',
          navPath: { segments: ['Setup', 'Einstein Setup'], quickFind: 'Einstein' },
          copyBlocks: [
            { id: 'cb1', label: 'Permission set', value: 'EinsteinGPTPromptTemplateManager', kind: 'apiName' },
          ],
        },
      ],
      checklist: [],
    },
  ],
  validation: [],
};

const prompts: Prompt[] = [
  {
    id: 'p1',
    title: 'Account Summary',
    description: 'Briefing before a meeting',
    tags: ['Account'],
    object: 'Account',
    grounding: ['{!$RecordSnapshot:Account.Snapshot}'],
    outputFormat: 'HTML',
    body: 'You are an assistant.',
  },
];

const troubleshooting: TroubleshootingEntry[] = [
  {
    id: 't1',
    journeyId: 'agentforce',
    symptom: 'Coworker button not showing up',
    cause: 'Step incomplete',
    fix: 'Complete step 6',
  },
];

const index = buildSearchIndex([journey], prompts, troubleshooting);

describe('buildSearchIndex', () => {
  it('creates records for sections, steps, nav paths, api names, prompts, and troubleshooting', () => {
    const types = new Set(index.map((r) => r.type));
    expect(types).toContain('section');
    expect(types).toContain('step');
    expect(types).toContain('navPath');
    expect(types).toContain('apiName');
    expect(types).toContain('prompt');
    expect(types).toContain('troubleshooting');
  });
});

describe('search', () => {
  it('returns [] for an empty query', () => {
    expect(search(index, '')).toEqual([]);
    expect(search(index, '   ')).toEqual([]);
  });

  it('finds a step by title token', () => {
    const hits = search(index, 'einstein');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((h) => h.record.title.includes('Einstein'))).toBe(true);
  });

  it('matches an exact API name from a copy block', () => {
    const hits = search(index, 'EinsteinGPTPromptTemplateManager');
    expect(hits.some((h) => h.record.type === 'apiName')).toBe(true);
  });

  it('requires ALL tokens to match (AND semantics)', () => {
    expect(search(index, 'enable einstein').length).toBeGreaterThan(0);
    expect(search(index, 'enable zzzznotpresent')).toHaveLength(0);
  });

  it('finds a troubleshooting entry by symptom', () => {
    const hits = search(index, 'coworker button');
    expect(hits.some((h) => h.record.type === 'troubleshooting')).toBe(true);
  });

  it('respects the result limit', () => {
    expect(search(index, 'e', 2).length).toBeLessThanOrEqual(2);
  });
});

describe('highlight', () => {
  it('marks matched segments and leaves the rest unmarked', () => {
    const segs = highlight('Enable Einstein AI', 'einstein');
    const marked = segs.filter((s) => s.match).map((s) => s.text);
    expect(marked).toContain('Einstein');
    expect(segs.map((s) => s.text).join('')).toBe('Enable Einstein AI');
  });

  it('returns a single unmarked segment for an empty query', () => {
    expect(highlight('Some text', '')).toEqual([{ text: 'Some text', match: false }]);
  });

  it('merges overlapping/adjacent matches from multiple tokens', () => {
    const segs = highlight('abcdef', 'abc cde');
    // "abc" and "cde" overlap → one merged marked segment "abcde"
    const marked = segs.filter((s) => s.match);
    expect(marked).toHaveLength(1);
    expect(marked[0].text).toBe('abcde');
  });
});
