import { useMemo, useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import type {
  CustomizeOptions,
  OutputType,
  Prompt,
  PromptObject,
  Tone,
} from '../lib/types';
import { customizePrompt, extractSalesforceTokens } from '../lib/customizePrompt';
import { useT, type UIKey } from '../lib/i18n';
import { CopyBlock } from './CopyBlock';
import { Badge } from './ui/Badge';
import { Callout } from './ui/Callout';

const OBJECTS: PromptObject[] = ['Account', 'Opportunity', 'Lead', 'Contact'];
const TONES: { value: Tone; labelKey: UIKey }[] = [
  { value: 'concise', labelKey: 'cz.tone.concise' },
  { value: 'executive', labelKey: 'cz.tone.executive' },
  { value: 'beginner-friendly', labelKey: 'cz.tone.beginner-friendly' },
  { value: 'persuasive', labelKey: 'cz.tone.persuasive' },
];
const OUTPUTS: { value: OutputType; labelKey: UIKey }[] = [
  { value: 'html', labelKey: 'cz.output.html' },
  { value: 'plain', labelKey: 'cz.output.plain' },
];
const LANGUAGES = [
  'EN_US',
  'EN_GB',
  'FR',
  'DE',
  'ES',
  'PT_BR',
  'JA',
  'IT',
  'NL',
];

const labelCls = 'mb-1 block text-sm font-semibold text-slate-600';
const controlCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:border-brand-400 focus-visible:ring-2';

export function PromptCustomizer({ prompt }: { prompt: Prompt }) {
  const t = useT();
  const [opts, setOpts] = useState<CustomizeOptions>({
    object: prompt.object,
    language: 'EN_US',
    tone: 'concise',
    wordLimit: null,
    outputType: prompt.outputFormat.toLowerCase().includes('plain')
      ? 'plain'
      : 'html',
  });

  const customized = useMemo(
    () => customizePrompt(prompt.body, opts, prompt.object),
    [prompt.body, prompt.object, opts],
  );

  const tokens = useMemo(
    () => extractSalesforceTokens(prompt.body),
    [prompt.body],
  );

  const set = <K extends keyof CustomizeOptions>(
    key: K,
    value: CustomizeOptions[K],
  ) => setOpts((prev) => ({ ...prev, [key]: value }));

  return (
    <section
      aria-labelledby="customizer-heading"
      className="rounded-card border border-slate-200 bg-white p-5 card-shadow"
    >
      <h3
        id="customizer-heading"
        className="flex items-center gap-2 text-lg font-bold text-ink"
      >
        <Wand2 className="h-5 w-5 text-brand-600" aria-hidden="true" />
        {t('cz.title')}
      </h3>
      <p className="mt-1 text-sm text-muted">{t('cz.helper')}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cz-object" className={labelCls}>
            {t('cz.targetObject')}
          </label>
          <select
            id="cz-object"
            value={opts.object}
            onChange={(e) => set('object', e.target.value as PromptObject)}
            className={controlCls}
          >
            {OBJECTS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cz-language" className={labelCls}>
            {t('cz.language')}
          </label>
          <select
            id="cz-language"
            value={opts.language}
            onChange={(e) => set('language', e.target.value)}
            className={controlCls}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cz-tone" className={labelCls}>
            {t('cz.tone')}
          </label>
          <select
            id="cz-tone"
            value={opts.tone}
            onChange={(e) => set('tone', e.target.value as Tone)}
            className={controlCls}
          >
            {TONES.map((toneOpt) => (
              <option key={toneOpt.value} value={toneOpt.value}>
                {t(toneOpt.labelKey)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cz-output" className={labelCls}>
            {t('cz.outputFormat')}
          </label>
          <select
            id="cz-output"
            value={opts.outputType}
            onChange={(e) => set('outputType', e.target.value as OutputType)}
            className={controlCls}
          >
            {OUTPUTS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.labelKey)}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="cz-wordlimit" className={labelCls}>
            {t('cz.wordLimit')}{' '}
            <span className="font-normal text-slate-400">
              {t('cz.optional')}
            </span>
          </label>
          <input
            id="cz-wordlimit"
            type="number"
            min={0}
            step={10}
            value={opts.wordLimit ?? ''}
            onChange={(e) =>
              set(
                'wordLimit',
                e.target.value === '' ? null : Math.max(0, Number(e.target.value)),
              )
            }
            placeholder={t('cz.wordLimitPlaceholder')}
            className={controlCls}
          />
        </div>
      </div>

      {/* Preserved Salesforce tokens */}
      {tokens.length > 0 && (
        <div className="mt-4">
          <p className={labelCls}>
            <Sparkles className="mr-1 inline h-4 w-4 text-brand-500" aria-hidden="true" />
            {t('cz.mergeFields')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tokens.map((token) => (
              <Badge key={token} tone="brand">
                <code className="font-mono text-[11px]">{token}</code>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Live preview */}
      <div className="mt-5">
        <p className={labelCls}>{t('cz.livePreview')}</p>
        <CopyBlock
          block={{
            id: `customized-${prompt.id}`,
            label: `${prompt.title} — ${t('cz.customizedSuffix')}`,
            value: customized,
            kind: 'promptText',
          }}
        />
      </div>

      <div className="mt-4">
        <Callout level="tip" title={t('cz.howToUse')}>
          {(() => {
            // Split on the {s} marker to inject the merge-field example as
            // <code> without embedding markup in the dictionary string.
            const [before, after] = t('cz.howToUseBody').split('{s}');
            return (
              <>
                {before}
                <code className="font-mono">{'{!$RecordSnapshot:…}'}</code>
                {after}
              </>
            );
          })()}
        </Callout>
      </div>
    </section>
  );
}
