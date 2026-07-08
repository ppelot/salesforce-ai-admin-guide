import { useId, useState, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

/** Accessible disclosure. A real <button aria-expanded> toggles a region. */
export function ExpandableSection({
  title,
  icon,
  defaultOpen = false,
  tone = 'neutral',
  children,
}: {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  tone?: 'neutral' | 'brand';
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  const headTone =
    tone === 'brand'
      ? 'text-brand-700 hover:bg-brand-50'
      : 'text-slate-700 hover:bg-slate-50';

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${headTone}`}
      >
        <ChevronRight
          className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
          aria-hidden="true"
        />
        {icon}
        <span>{title}</span>
      </button>
      {open && (
        <div
          id={panelId}
          className="border-t border-slate-100 px-3 py-3 text-sm text-slate-700"
        >
          {children}
        </div>
      )}
    </div>
  );
}
