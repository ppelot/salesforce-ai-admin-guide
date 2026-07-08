// ============================================================================
// String -> lucide icon resolver. Data files reference icons by name (keeping
// them JSX-free and serializable); components resolve to a component here.
// ============================================================================

import {
  Bot,
  Sparkles,
  BookOpen,
  ListChecks,
  ShieldCheck,
  Database,
  Users,
  Search,
  Wrench,
  Zap,
  FileText,
  Rocket,
  FlaskConical,
  CalendarClock,
  GitBranch,
  Mail,
  LayoutGrid,
  CheckCircle2,
  Settings,
  KeyRound,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  bot: Bot,
  sparkles: Sparkles,
  book: BookOpen,
  checklist: ListChecks,
  shield: ShieldCheck,
  database: Database,
  users: Users,
  search: Search,
  wrench: Wrench,
  zap: Zap,
  file: FileText,
  rocket: Rocket,
  flask: FlaskConical,
  schedule: CalendarClock,
  flow: GitBranch,
  mail: Mail,
  grid: LayoutGrid,
  check: CheckCircle2,
  settings: Settings,
  key: KeyRound,
};

/** Resolve an icon by name, falling back to a neutral icon. */
export function getIcon(name: string | undefined): LucideIcon {
  if (name && ICONS[name]) return ICONS[name];
  return FileText;
}
