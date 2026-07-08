import type { ReactNode } from 'react';
import {
  AlertTriangle,
  Info,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';
import type { WarningLevel } from '../../lib/types';
import { useT, type UIKey } from '../../lib/i18n';

const STYLES: Record<
  WarningLevel,
  { wrap: string; icon: typeof Info; iconColor: string; labelKey: UIKey }
> = {
  info: {
    wrap: 'bg-info-soft border-cyan-200',
    icon: Info,
    iconColor: 'text-info',
    labelKey: 'callout.info',
  },
  tip: {
    wrap: 'bg-brand-50 border-brand-200',
    icon: Lightbulb,
    iconColor: 'text-brand-600',
    labelKey: 'callout.tip',
  },
  warning: {
    wrap: 'bg-warning-soft border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-warning',
    labelKey: 'callout.warning',
  },
  blocker: {
    wrap: 'bg-danger-soft border-red-200',
    icon: ShieldAlert,
    iconColor: 'text-danger',
    labelKey: 'callout.blocker',
  },
};

export function Callout({
  level,
  title,
  children,
}: {
  level: WarningLevel;
  title?: string;
  children: ReactNode;
}) {
  const t = useT();
  const s = STYLES[level];
  const Icon = s.icon;
  return (
    <div className={`rounded-lg border p-3 ${s.wrap}`} role="note">
      <div className="flex gap-2.5">
        <Icon
          className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${s.iconColor}`}
          aria-hidden="true"
        />
        <div className="min-w-0 text-sm text-ink">
          <p className="font-semibold">{title ?? t(s.labelKey)}</p>
          <div className="mt-0.5 text-slate-700">{children}</div>
        </div>
      </div>
    </div>
  );
}
