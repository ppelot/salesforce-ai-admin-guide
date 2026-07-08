import { Check, Copy } from 'lucide-react';
import type { CopyBlockKind } from '../lib/types';
import { useCopy } from '../lib/useCopy';
import { useAppDispatch } from '../lib/state';
import { useT } from '../lib/i18n';

let copySeq = 0;

/**
 * A button-only copy control (no value preview) for places where showing the
 * full text would be too large — e.g. prompt cards. Records to copy history,
 * same as CopyBlock.
 */
export function CopyButton({
  value,
  label,
  kind = 'value',
  className,
  children,
}: {
  value: string;
  label: string;
  kind?: CopyBlockKind;
  className?: string;
  children?: React.ReactNode;
}) {
  const { copied, copy } = useCopy();
  const dispatch = useAppDispatch();
  const t = useT();

  const onCopy = async () => {
    const ok = await copy(value);
    if (ok) {
      dispatch({
        type: 'RECORD_COPY',
        event: {
          id: `copy-${Date.now()}-${copySeq++}`,
          at: Date.now(),
          label,
          value,
          kind,
        },
      });
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={t('copy.copyLabel', { label })}
      className={
        className ??
        'inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700 focus-visible:ring-2'
      }
    >
      {copied ? (
        <Check className="h-4 w-4 text-success" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
      {copied ? t('copy.copied') : (children ?? t('copy.copy'))}
      <span className="sr-only" aria-live="polite">
        {copied ? t('copy.copiedToClipboard', { label }) : ''}
      </span>
    </button>
  );
}
