import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Database,
  FileOutput,
  Target,
} from 'lucide-react';
import { promptTags } from '../data/promptLibrary';
import { getPrompts } from '../data';
import { useRoute } from '../lib/router';
import { useT, useLanguage, tagLabel } from '../lib/i18n';
import { CopyBlock } from './CopyBlock';
import { CopyButton } from './CopyButton';
import { PromptCustomizer } from './PromptCustomizer';
import { Badge } from './ui/Badge';
import { Disclaimer } from './ui/Disclaimer';

/** Detail view for one prompt: metadata, full body, and the customizer. */
function PromptDetail({ promptId }: { promptId: string }) {
  const { navigate } = useRoute();
  const t = useT();
  const lang = useLanguage();
  const prompt = getPrompts(lang).find((p) => p.id === promptId);

  if (!prompt) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="rounded-card border border-slate-200 bg-white p-6 text-center text-muted">
          {t('library.notFound')}
        </p>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate({ kind: 'library' })}
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            {t('library.backToLibrary')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={() => navigate({ kind: 'library' })}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('library.allPrompts')}
      </button>

      <header className="mb-5">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {prompt.tags.map((tag) => (
            <Badge key={tag} tone="brand">
              {tagLabel(lang, tag)}
            </Badge>
          ))}
        </div>
        <h1 className="text-2xl font-bold text-ink">{prompt.title}</h1>
        <p className="mt-1.5 text-[15px] text-slate-600">{prompt.description}</p>
      </header>

      {/* Metadata */}
      <dl className="mb-5 grid gap-3 rounded-card border border-slate-200 bg-white p-4 card-shadow sm:grid-cols-3">
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Target className="h-3.5 w-3.5" aria-hidden="true" />
            {t('library.object')}
          </dt>
          <dd className="mt-1 text-sm text-slate-800">{prompt.object}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <FileOutput className="h-3.5 w-3.5" aria-hidden="true" />
            {t('library.output')}
          </dt>
          <dd className="mt-1 text-sm text-slate-800">{prompt.outputFormat}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Database className="h-3.5 w-3.5" aria-hidden="true" />
            {t('library.grounding')}
          </dt>
          <dd className="mt-1 space-y-0.5 text-sm text-slate-800">
            {prompt.grounding.map((g) => (
              <code key={g} className="block break-all font-mono text-[12px]">
                {g}
              </code>
            ))}
          </dd>
        </div>
      </dl>

      {/* Original body */}
      <div className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('library.template')}
        </h2>
        <CopyBlock
          block={{
            id: `prompt-${prompt.id}`,
            label: prompt.title,
            value: prompt.body,
            kind: 'promptText',
          }}
        />
      </div>

      {/* Customizer */}
      <PromptCustomizer prompt={prompt} />
    </div>
  );
}

/** Grid view: filterable cards. */
function PromptGrid() {
  const { navigate } = useRoute();
  const t = useT();
  const lang = useLanguage();
  const prompts = getPrompts(lang);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      activeTag
        ? prompts.filter((p) => (p.tags as string[]).includes(activeTag))
        : prompts,
    [activeTag, prompts],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
          <BookOpen className="h-6 w-6 text-brand-600" aria-hidden="true" />
          {t('library.h1')}
        </h1>
        <p className="mt-1.5 text-[15px] text-muted">
          {t('library.intro', { n: prompts.length })}
        </p>
      </header>

      {/* Tag filter */}
      <div
        className="mb-5 flex flex-wrap gap-2"
        role="group"
        aria-label={t('library.filterByTag')}
      >
        <button
          type="button"
          onClick={() => setActiveTag(null)}
          aria-pressed={activeTag === null}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTag === null
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
          }`}
        >
          {t('library.all', { n: prompts.length })}
        </button>
        {promptTags.map((tag) => {
          const count = prompts.filter((p) =>
            (p.tags as string[]).includes(tag),
          ).length;
          if (count === 0) return null;
          const active = activeTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(active ? null : tag)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
              }`}
            >
              {tagLabel(lang, tag)} ({count})
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((prompt) => (
          <article
            key={prompt.id}
            className="flex flex-col rounded-card border border-slate-200 bg-white p-5 card-shadow"
          >
            <div className="mb-2 flex flex-wrap gap-1.5">
              {prompt.tags.map((tag) => (
                <Badge key={tag} tone="brand">
                  {tagLabel(lang, tag)}
                </Badge>
              ))}
            </div>
            <h2 className="text-lg font-bold text-ink">{prompt.title}</h2>
            <p className="mt-1.5 flex-1 text-sm text-slate-600">
              {prompt.description}
            </p>
            <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Target className="h-3.5 w-3.5" aria-hidden="true" />
                <dt className="sr-only">{t('library.object')}</dt>
                <dd>{prompt.object}</dd>
              </div>
              <div className="flex items-center gap-1">
                <FileOutput className="h-3.5 w-3.5" aria-hidden="true" />
                <dt className="sr-only">{t('library.output')}</dt>
                <dd className="truncate">{prompt.outputFormat}</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  navigate({ kind: 'library', promptId: prompt.id })
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                {t('library.openCustomize')}
              </button>
              <CopyButton
                value={prompt.body}
                label={prompt.title}
                kind="promptText"
              >
                {t('library.copyTemplate')}
              </CopyButton>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
}

export function PromptLibrary({ promptId }: { promptId?: string }) {
  return promptId ? <PromptDetail promptId={promptId} /> : <PromptGrid />;
}
