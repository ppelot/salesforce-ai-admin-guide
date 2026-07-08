// ============================================================================
// Tiny in-memory search: flatten all guide data into uniform SearchRecords,
// then AND-token substring match. No external search lib — offline, tiny,
// predictable over a few hundred records. highlight() returns data (not JSX)
// so it stays testable; the component wraps matched segments in <mark>.
// ============================================================================

import type {
  HighlightSegment,
  Journey,
  Prompt,
  Route,
  SearchHit,
  SearchRecord,
  TroubleshootingEntry,
} from './types';

function navPathText(segments: string[], quickFind?: string): string {
  return [...segments, quickFind ?? ''].join(' ');
}

/** Build the flat, pre-lowercased search index once at module load. */
export function buildSearchIndex(
  journeys: Journey[],
  prompts: Prompt[],
  troubleshooting: TroubleshootingEntry[],
): SearchRecord[] {
  const records: SearchRecord[] = [];

  for (const journey of journeys) {
    for (const section of journey.sections) {
      const sectionRoute: Route = {
        kind: 'journey',
        journeyId: journey.id,
        sectionId: section.id,
      };
      records.push({
        id: `section:${journey.id}:${section.id}`,
        type: 'section',
        title: section.title,
        breadcrumb: journey.title,
        haystack: [section.title, section.intro ?? '', section.doneWhen ?? '']
          .join(' ')
          .toLowerCase(),
        route: sectionRoute,
      });

      for (const step of section.steps) {
        const copyText = (step.copyBlocks ?? [])
          .map((c) => `${c.label} ${c.value}`)
          .join(' ');
        const valueText = (step.valuesToEnter ?? [])
          .map((v) => `${v.field} ${v.value}`)
          .join(' ');
        const navText = step.navPath
          ? navPathText(step.navPath.segments, step.navPath.quickFind)
          : '';
        const warnText = (step.warnings ?? [])
          .map((w) => `${w.title} ${w.body}`)
          .join(' ');

        records.push({
          id: `step:${journey.id}:${step.id}`,
          type: 'step',
          title: step.title,
          breadcrumb: `${journey.title} › ${section.title}`,
          haystack: [
            step.title,
            step.summary,
            navText,
            valueText,
            copyText,
            warnText,
            step.whyItMatters ?? '',
            step.beginnerTip ?? '',
            (step.instructions ?? []).join(' '),
          ]
            .join(' ')
            .toLowerCase(),
          route: sectionRoute,
        });

        // Dedicated records so an exact API name / nav path hits directly.
        if (step.navPath) {
          records.push({
            id: `nav:${journey.id}:${step.id}`,
            type: 'navPath',
            title: step.navPath.segments.join(' › '),
            breadcrumb: step.title,
            haystack: navText.toLowerCase(),
            route: sectionRoute,
          });
        }
        for (const cb of step.copyBlocks ?? []) {
          if (cb.kind === 'apiName' || cb.kind === 'flowRef') {
            records.push({
              id: `api:${journey.id}:${cb.id}`,
              type: 'apiName',
              title: cb.value,
              breadcrumb: `${step.title} — ${cb.label}`,
              haystack: `${cb.label} ${cb.value}`.toLowerCase(),
              route: sectionRoute,
            });
          }
        }
      }
    }
  }

  for (const prompt of prompts) {
    records.push({
      id: `prompt:${prompt.id}`,
      type: 'prompt',
      title: prompt.title,
      breadcrumb: 'Prompt Library',
      haystack: [
        prompt.title,
        prompt.description,
        prompt.tags.join(' '),
        prompt.object,
        prompt.grounding.join(' '),
        prompt.outputFormat,
        prompt.body,
      ]
        .join(' ')
        .toLowerCase(),
      route: { kind: 'library', promptId: prompt.id },
    });
  }

  for (const entry of troubleshooting) {
    records.push({
      id: `ts:${entry.id}`,
      type: 'troubleshooting',
      title: entry.symptom,
      breadcrumb: 'Troubleshooting',
      haystack: [entry.symptom, entry.cause, entry.fix, (entry.tags ?? []).join(' ')]
        .join(' ')
        .toLowerCase(),
      route: { kind: 'troubleshoot', symptomId: entry.id },
    });
  }

  return records;
}

function tokenize(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

/** AND-token substring match; title hits and early positions score higher. */
export function search(
  index: SearchRecord[],
  query: string,
  limit = 50,
): SearchHit[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const hits: SearchHit[] = [];
  for (const record of index) {
    const title = record.title.toLowerCase();
    let ok = true;
    let score = 0;
    for (const t of tokens) {
      const inHay = record.haystack.indexOf(t);
      if (inHay === -1) {
        ok = false;
        break;
      }
      const inTitle = title.indexOf(t);
      if (inTitle !== -1) {
        score += 10 - Math.min(inTitle, 9); // earlier in title = better
      } else {
        score += 2 - Math.min(inHay / 200, 1.5);
      }
    }
    if (ok) hits.push({ record, score });
  }

  hits.sort((a, b) => b.score - a.score || a.record.title.length - b.record.title.length);
  return hits.slice(0, limit);
}

/** Split text into segments, marking any that match a query token. */
export function highlight(text: string, query: string): HighlightSegment[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [{ text, match: false }];

  const lower = text.toLowerCase();
  // Collect all match ranges, then merge overlaps.
  const ranges: Array<[number, number]> = [];
  for (const t of tokens) {
    let from = 0;
    for (;;) {
      const idx = lower.indexOf(t, from);
      if (idx === -1) break;
      ranges.push([idx, idx + t.length]);
      from = idx + t.length;
    }
  }
  if (ranges.length === 0) return [{ text, match: false }];

  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const [s, e] of ranges) {
    const last = merged[merged.length - 1];
    if (last && s <= last[1]) {
      last[1] = Math.max(last[1], e);
    } else {
      merged.push([s, e]);
    }
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const [s, e] of merged) {
    if (s > cursor) segments.push({ text: text.slice(cursor, s), match: false });
    segments.push({ text: text.slice(s, e), match: true });
    cursor = e;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), match: false });
  }
  return segments;
}
