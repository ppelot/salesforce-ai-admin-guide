import { describe, expect, it } from 'vitest';
import { customizePrompt, extractSalesforceTokens } from './customizePrompt';
import type { CustomizeOptions } from './types';

const base: CustomizeOptions = {
  object: 'Account',
  language: 'EN_US',
  tone: 'concise',
  wordLimit: null,
  outputType: 'html',
};

describe('customizePrompt — token safety', () => {
  it('preserves {!$...} Salesforce tokens byte-for-byte', () => {
    const template =
      'Brief on {!$Input:Account.Name}. Data: {!$RecordSnapshot:Account.Snapshot}';
    const out = customizePrompt(template, base, 'Account');
    expect(out).toContain('{!$Input:Account.Name}');
    expect(out).toContain('{!$RecordSnapshot:Account.Snapshot}');
  });

  it('does NOT swap the object noun inside a token when changing object', () => {
    const template = 'Summarize the Account. Ref: {!$Input:Account.Name}';
    const out = customizePrompt(
      template,
      { ...base, object: 'Opportunity' },
      'Account',
    );
    // Prose noun swapped…
    expect(out).toContain('Summarize the Opportunity.');
    // …but the token is untouched.
    expect(out).toContain('{!$Input:Account.Name}');
    expect(out).not.toContain('{!$Input:Opportunity.Name}');
  });

  it('leaves prose unchanged when object is unchanged', () => {
    const template = 'Summarize the Account thoroughly.';
    const out = customizePrompt(template, base, 'Account');
    expect(out).toContain('Summarize the Account thoroughly.');
  });

  it('only swaps whole-word occurrences of the object noun', () => {
    const template = 'Accountability matters for the Account.';
    const out = customizePrompt(
      template,
      { ...base, object: 'Lead' },
      'Account',
    );
    expect(out).toContain('Accountability matters');
    expect(out).toContain('for the Lead.');
  });
});

describe('customizePrompt — directive block', () => {
  it('appends a customization directive block', () => {
    const out = customizePrompt('Body.', base, 'Account');
    expect(out).toContain('Customization directives:');
    expect(out).toContain('clean HTML rich text');
    expect(out).toContain('The response should be in EN_US.');
  });

  it('adds a word-limit line only when a positive limit is set', () => {
    const withLimit = customizePrompt('Body.', { ...base, wordLimit: 150 }, 'Account');
    expect(withLimit).toContain('under 150 words');

    const noLimit = customizePrompt('Body.', { ...base, wordLimit: null }, 'Account');
    expect(noLimit).not.toMatch(/under \d+ words/);
  });

  it('reflects plain-text output selection', () => {
    const out = customizePrompt('Body.', { ...base, outputType: 'plain' }, 'Account');
    expect(out).toContain('plain text');
    expect(out).not.toContain('clean HTML rich text');
  });

  it('is idempotent — re-customizing does not stack directive blocks', () => {
    const once = customizePrompt('Body.', base, 'Account');
    const twice = customizePrompt(once, { ...base, tone: 'executive' }, 'Account');
    const occurrences = twice.split('Customization directives:').length - 1;
    expect(occurrences).toBe(1);
    expect(twice).toContain('executive tone');
  });

  it('does not stack even after many re-runs', () => {
    let out = customizePrompt('Body.', base, 'Account');
    for (let i = 0; i < 5; i++) {
      out = customizePrompt(out, base, 'Account');
    }
    expect(out.split('Customization directives:').length - 1).toBe(1);
  });
});

describe('extractSalesforceTokens', () => {
  it('returns distinct tokens in the text', () => {
    const text =
      '{!$Input:Account.Name} and {!$Input:Account.Name} and {!$RecordSnapshot:Account.Snapshot}';
    expect(extractSalesforceTokens(text)).toEqual([
      '{!$Input:Account.Name}',
      '{!$RecordSnapshot:Account.Snapshot}',
    ]);
  });

  it('returns an empty array when there are no tokens', () => {
    expect(extractSalesforceTokens('plain text, no tokens')).toEqual([]);
  });
});
