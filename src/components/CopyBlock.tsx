import { Check, Copy } from 'lucide-react';
import { useCopy } from '../lib/useCopy';
import { useAppDispatch } from '../lib/state';
import { useT } from '../lib/i18n';
import type { CopyBlock as CopyBlockData, CopyBlockKind } from '../lib/types';

let copySeq = 0;

/** Multiline kinds render in a <pre>; short kinds render inline. */
function isBlockKind(kind: CopyBlockKind): boolean {
  return kind === 'promptText' || kind === 'json' || kind === 'code';
}

export function CopyBlock({
  block,
  compact = false,
}: {
  block: CopyBlockData;
  compact?: boolean;
}) {
  const { copied, copy } = useCopy();
  const dispatch = useAppDispatch();
  const t = useT();

  const onCopy = async () => {
    const ok = await copy(block.value);
    if (ok) {
      dispatch({
        type: 'RECORD_COPY',
        event: {
          id: `copy-${Date.now()}-${copySeq++}`,
          at: Date.now(),
          label: block.label,
          value: block.value,
          kind: block.kind,
        },
      });
    }
  };

  const button = (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-brand-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:ring-2"
      aria-label={t('copy.copyLabel', { label: block.label })}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {copied ? t('copy.copied') : t('copy.copy')}
    </button>
  );

  // Polite live region announces the copy for screen-reader users.
  const liveRegion = (
    <span className="sr-only" aria-live="polite">
      {copied ? t('copy.copiedToClipboard', { label: block.label }) : ''}
    </span>
  );

  if (isBlockKind(block.kind)) {
    return (
      <figure className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <figcaption className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2">
          <span className="text-xs font-semibold text-slate-600">
            {block.label}
          </span>
          {button}
        </figcaption>
        <pre className="code-wrap max-h-96 overflow-auto p-3 font-mono text-[13px] leading-relaxed text-slate-800">
          {block.value}
        </pre>
        {liveRegion}
      </figure>
    );
  }

  // Inline (apiName / value / flowRef)
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 ${
        compact ? '' : 'my-1'
      }`}
    >
      <div className="min-w-0">
        {!compact && (
          <span className="mr-2 text-xs font-medium text-slate-500">
            {block.label}
          </span>
        )}
        <code className="break-all font-mono text-[13px] text-slate-800">
          {block.value}
        </code>
      </div>
      {button}
      {liveRegion}
    </div>
  );
}
