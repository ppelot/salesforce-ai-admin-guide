import { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Info,
  Lightbulb,
  Copy,
  Check,
  Workflow,
  Home as HomeIcon,
} from 'lucide-react';
import { useRoute } from '../lib/router';
import { useLanguage } from '../lib/i18n';
import type { Language } from '../lib/types';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const FAULT_EMAIL_BODY = `The scheduled Account Summary flow failed.

Account Id: {!$Record.Id}
Account Name: {!$Record.Name}

Please check Setup > Paused and Failed Flow Interviews for more details.`;

interface StepData {
  id: string;
  title: string;
  where?: string;
  summary: string;
  instructions: string[];
  values?: { field: string; value: string; copyable?: boolean }[];
  copyBlocks?: { label: string; value: string }[];
  tip?: string;
  warning?: string;
  blocker?: string;
  previewImg?: string;
}

interface GuideContent {
  pageTitle: string;
  pageSubtitle: string;
  homeLabel: string;
  flowPreviewLabel: string;
  doneWhen: string;
  doneWhenLabel: string;
  settingLabel: string;
  valueLabel: string;
  markComplete: string;
  completed: string;
  blockerLabel: string;
  copiedLabel: string;
  copyLabel: string;
  flowPills: string[];
  faultPill: string;
  steps: StepData[];
}

const content: Record<Language, GuideContent> = {
  en: {
    pageTitle: 'Build the Flow: Daily Account Meeting Briefing',
    pageSubtitle: 'Step-by-step guide to build the Schedule-Triggered Flow in Flow Builder',
    homeLabel: 'Home',
    flowPreviewLabel: 'Flow Preview',
    doneWhen: 'Flow runs prompt, checks response, updates Account, has fault handling.',
    doneWhenLabel: 'Done when:',
    settingLabel: 'Setting',
    valueLabel: 'Value',
    markComplete: 'Mark as complete',
    completed: 'Completed',
    blockerLabel: 'ATTENTION:',
    copiedLabel: 'Copied!',
    copyLabel: 'Copy',
    flowPills: ['Schedule (Daily 06:30)', 'Find Accounts', 'Run AI Prompt', 'Decision', 'Update Account'],
    faultPill: 'Fault: Email',
    steps: [
      {
        id: 'create-flow',
        title: 'Step 1 — Create the Schedule-Triggered Flow',
        where: 'Setup > Flows > New Flow > Schedule-Triggered Flow',
        summary: 'Create a daily scheduled flow targeting Accounts.',
        previewImg: 'https://i.postimg.cc/5ypdrzLf/2026-07-07-11-38-18.jpg',
        instructions: [
          'Go to Setup > Flows > click New Flow.',
          'Select Schedule-Triggered Flow > Create.',
          'Configure the Start element schedule.',
          'Set Object to Account.',
          'Add filter: Industry Does Not Equal (blank).',
          'Click Done.',
        ],
        values: [
          { field: 'Start Time', value: '06:30 (before users arrive)' },
          { field: 'Frequency', value: 'Daily' },
          { field: 'Object', value: 'Account' },
          { field: 'Filter', value: 'Industry Does Not Equal Blank' },
        ],
        tip: 'Start with a restrictive filter. Test with a few Accounts first, then expand. Scheduled time uses the org default time zone (Setup > Company Information).',
      },
      {
        id: 'prompt-action',
        title: 'Step 2 — Add the Prompt Template Action',
        summary: 'Add the prompt action and set RelatedEntity using text/formula mode.',
        previewImg: 'https://i.postimg.cc/qvJLTMZP/2026-07-07-15-11-55.jpg',
        instructions: [
          'Click + after the Start element.',
          'Select Action.',
          'Search for Account Summary Prompt.',
          'Select the action.',
          'Find the RelatedEntity input field.',
          'Switch the field to text/formula mode (click the toggle icon).',
          'Type the JSON value manually (see copy block below).',
        ],
        copyBlocks: [
          { label: 'RelatedEntity input (type manually!)', value: '{"Id":"{!$Record.Id}"}' },
          { label: 'Output: Prompt Response', value: '{!Run_Account_Summary_Prompt.PromptResponse}' },
        ],
        blocker: 'Do NOT pick $Record or "Triggering Account" from the resource picker — that causes a RelatedEntity format error. Switch to text/formula mode and type the JSON manually.',
      },
      {
        id: 'decision',
        title: 'Step 3 — Add a Decision element',
        summary: 'Check that the prompt returned a response before updating the Account.',
        previewImg: 'https://i.postimg.cc/MTbhcBs1/2026-07-07-11-38-37.jpg',
        instructions: [
          'Click + after the Action.',
          'Select Decision.',
          'Label: Was Prompt Response Generated?',
          'Positive Outcome: Generated.',
          'Resource: {!Run_Account_Summary_Prompt.PromptResponse}',
          'Operator: Is Null',
          'Value: {!$GlobalConstant.False}',
          'Default Outcome: No Response.',
        ],
        values: [
          { field: 'Decision Label', value: 'Was Prompt Response Generated?' },
          { field: 'Positive Outcome', value: 'Generated' },
          { field: 'Resource', value: '{!Run_Account_Summary_Prompt.PromptResponse}', copyable: true },
          { field: 'Operator', value: 'Is Null' },
          { field: 'Value', value: '{!$GlobalConstant.False}', copyable: true },
          { field: 'Default Outcome', value: 'No Response' },
        ],
        tip: 'If the response is not null → "Generated" path. If null → "No Response" (do nothing, next Account).',
      },
      {
        id: 'update-record',
        title: 'Step 4 — Update the Account (Generated path)',
        summary: 'Write the prompt response into the briefing field.',
        previewImg: 'https://i.postimg.cc/CKLSkDrr/2026-07-07-15-26-09.jpg',
        instructions: [
          'On the Generated path, click +.',
          'Select Update Records.',
          'Label: Update Account with Briefing.',
          'How to Find Records: Use the account $Record global variable.',
          'Set Account_Meeting_Briefing__c = {!Run_Account_Summary_Prompt.PromptResponse}.',
        ],
        values: [
          { field: 'Label', value: 'Update Account with Briefing' },
          { field: 'Find Records', value: 'Use the account $Record global variable' },
          { field: 'Field', value: 'Account_Meeting_Briefing__c', copyable: true },
          { field: 'Value', value: '{!Run_Account_Summary_Prompt.PromptResponse}', copyable: true },
        ],
      },
      {
        id: 'fault-handling',
        title: 'Step 5 (Optional) — Add fault handling',
        summary: 'Email admin if either the prompt action or the update fails.',
        instructions: [
          'Click the Prompt Template Action element.',
          'Select Add Fault Path.',
          'On the Fault Path, add a Send Email action.',
          'Repeat for the Update Records element.',
        ],
        values: [
          { field: 'To', value: 'Your admin email address' },
          { field: 'Subject', value: 'Account Summary Scheduled Flow Failed', copyable: true },
        ],
        copyBlocks: [
          { label: 'Email body', value: FAULT_EMAIL_BODY },
        ],
        warning: 'Add a fault path on BOTH the Prompt Action and the Update Records element.',
      },
      {
        id: 'save-flow',
        title: 'Step 6 — Save the flow',
        summary: 'Save with a clear name. Do NOT activate yet.',
        instructions: [
          'Click Save.',
          'Enter Flow Label: Daily Account Meeting Briefing.',
          'Enter Flow API Name: Daily_Account_Meeting_Briefing.',
          'Click Save.',
        ],
        values: [
          { field: 'Flow Label', value: 'Daily Account Meeting Briefing', copyable: true },
          { field: 'Flow API Name', value: 'Daily_Account_Meeting_Briefing', copyable: true },
        ],
        blocker: 'Do NOT activate yet in production org! Test in Sandbox first.',
      },
    ],
  },
  fr: {
    pageTitle: 'Construire le Flow : Daily Account Meeting Briefing',
    pageSubtitle: 'Guide pas-à-pas pour construire le flux planifié dans Flow Builder',
    homeLabel: 'Accueil',
    flowPreviewLabel: 'Aperçu du Flow',
    doneWhen: 'Le flux exécute le prompt, vérifie la réponse, met à jour le compte et gère les erreurs.',
    doneWhenLabel: 'Terminé quand :',
    settingLabel: 'Paramètre',
    valueLabel: 'Valeur',
    markComplete: 'Marquer comme terminé',
    completed: 'Terminé',
    blockerLabel: 'ATTENTION :',
    copiedLabel: 'Copié !',
    copyLabel: 'Copier',
    flowPills: ['Planification (06:30)', 'Trouver les comptes', 'Exécuter le prompt IA', 'Décision', 'Mettre à jour le compte'],
    faultPill: 'Erreur : Email',
    steps: [
      {
        id: 'create-flow',
        title: 'Étape 1 — Créer le flux planifié (Schedule-Triggered Flow)',
        where: 'Configuration > Flux > Nouveau flux > Flux déclenché par planification',
        summary: 'Créer un flux quotidien ciblant les comptes.',
        previewImg: 'https://i.postimg.cc/5ypdrzLf/2026-07-07-11-38-18.jpg',
        instructions: [
          'Allez dans Configuration > Flux > cliquez sur Nouveau flux.',
          'Sélectionnez Flux déclenché par planification > Créer.',
          'Configurez la planification de l\'élément Début.',
          'Définissez l\'objet sur Account (Compte).',
          'Ajoutez un filtre : Secteur d\'activité n\'est pas égal à (vide).',
          'Cliquez sur Terminé.',
        ],
        values: [
          { field: 'Heure de début', value: '06:30 (avant l\'arrivée des utilisateurs)' },
          { field: 'Fréquence', value: 'Quotidien (Daily)' },
          { field: 'Objet', value: 'Account' },
          { field: 'Filtre', value: 'Industry (Secteur) n\'est pas égal à Vide' },
        ],
        tip: 'Commencez avec un filtre restrictif. Testez d\'abord avec quelques comptes, puis élargissez. L\'heure planifiée utilise le fuseau horaire par défaut de l\'org (Configuration > Informations sur la société).',
      },
      {
        id: 'prompt-action',
        title: 'Étape 2 — Ajouter l\'action Prompt Template',
        summary: 'Ajouter l\'action du prompt et configurer RelatedEntity en mode texte/formule.',
        previewImg: 'https://i.postimg.cc/qvJLTMZP/2026-07-07-15-11-55.jpg',
        instructions: [
          'Cliquez sur + après l\'élément Début.',
          'Sélectionnez Action.',
          'Recherchez Account Summary Prompt.',
          'Sélectionnez l\'action.',
          'Trouvez le champ d\'entrée RelatedEntity.',
          'Passez le champ en mode texte/formule (cliquez sur l\'icône de bascule).',
          'Saisissez la valeur JSON manuellement (voir le bloc à copier ci-dessous).',
        ],
        copyBlocks: [
          { label: 'Entrée RelatedEntity (saisir manuellement !)', value: '{"Id":"{!$Record.Id}"}' },
          { label: 'Sortie : Prompt Response', value: '{!Run_Account_Summary_Prompt.PromptResponse}' },
        ],
        blocker: 'Ne sélectionnez PAS $Record ou « Triggering Account » depuis le sélecteur de ressources — cela provoque une erreur de format RelatedEntity. Passez en mode texte/formule et tapez le JSON manuellement.',
      },
      {
        id: 'decision',
        title: 'Étape 3 — Ajouter un élément Décision',
        summary: 'Vérifier que le prompt a renvoyé une réponse avant de mettre à jour le compte.',
        previewImg: 'https://i.postimg.cc/MTbhcBs1/2026-07-07-11-38-37.jpg',
        instructions: [
          'Cliquez sur + après l\'Action.',
          'Sélectionnez Décision.',
          'Libellé : Was Prompt Response Generated?',
          'Résultat positif : Generated.',
          'Ressource : {!Run_Account_Summary_Prompt.PromptResponse}',
          'Opérateur : Is Null (Est nul)',
          'Valeur : {!$GlobalConstant.False}',
          'Résultat par défaut : No Response.',
        ],
        values: [
          { field: 'Libellé Décision', value: 'Was Prompt Response Generated?' },
          { field: 'Résultat positif', value: 'Generated' },
          { field: 'Ressource', value: '{!Run_Account_Summary_Prompt.PromptResponse}', copyable: true },
          { field: 'Opérateur', value: 'Is Null' },
          { field: 'Valeur', value: '{!$GlobalConstant.False}', copyable: true },
          { field: 'Résultat par défaut', value: 'No Response' },
        ],
        tip: 'Si la réponse n\'est pas nulle → chemin « Generated ». Si nulle → « No Response » (ne rien faire, passer au compte suivant).',
      },
      {
        id: 'update-record',
        title: 'Étape 4 — Mettre à jour le compte (chemin Generated)',
        summary: 'Écrire la réponse du prompt dans le champ briefing.',
        previewImg: 'https://i.postimg.cc/CKLSkDrr/2026-07-07-15-26-09.jpg',
        instructions: [
          'Sur le chemin Generated, cliquez sur +.',
          'Sélectionnez Mettre à jour des enregistrements.',
          'Libellé : Update Account with Briefing.',
          'Comment trouver les enregistrements : Utiliser la variable globale $Record du compte.',
          'Définir Account_Meeting_Briefing__c = {!Run_Account_Summary_Prompt.PromptResponse}.',
        ],
        values: [
          { field: 'Libellé', value: 'Update Account with Briefing' },
          { field: 'Trouver les enregistrements', value: 'Utiliser la variable globale $Record du compte' },
          { field: 'Champ', value: 'Account_Meeting_Briefing__c', copyable: true },
          { field: 'Valeur', value: '{!Run_Account_Summary_Prompt.PromptResponse}', copyable: true },
        ],
      },
      {
        id: 'fault-handling',
        title: 'Étape 5 (Optionnel) — Ajouter la gestion des erreurs',
        summary: 'Envoyer un email à l\'admin si l\'action prompt ou la mise à jour échoue.',
        instructions: [
          'Cliquez sur l\'élément Action Prompt Template.',
          'Sélectionnez Ajouter un chemin d\'erreur (Fault Path).',
          'Sur le chemin d\'erreur, ajoutez une action Envoyer un email.',
          'Répétez pour l\'élément Mettre à jour des enregistrements.',
        ],
        values: [
          { field: 'À', value: 'Adresse email de l\'administrateur' },
          { field: 'Objet', value: 'Account Summary Scheduled Flow Failed', copyable: true },
        ],
        copyBlocks: [
          { label: 'Corps de l\'email', value: FAULT_EMAIL_BODY },
        ],
        warning: 'Ajoutez un chemin d\'erreur sur LES DEUX éléments : l\'Action Prompt et la Mise à jour des enregistrements.',
      },
      {
        id: 'save-flow',
        title: 'Étape 6 — Enregistrer le flux',
        summary: 'Enregistrer avec un nom clair. Ne PAS activer pour l\'instant.',
        instructions: [
          'Cliquez sur Enregistrer.',
          'Saisissez le libellé du flux : Daily Account Meeting Briefing.',
          'Saisissez le nom API du flux : Daily_Account_Meeting_Briefing.',
          'Cliquez sur Enregistrer.',
        ],
        values: [
          { field: 'Libellé du flux', value: 'Daily Account Meeting Briefing', copyable: true },
          { field: 'Nom API du flux', value: 'Daily_Account_Meeting_Briefing', copyable: true },
        ],
        blocker: 'Ne PAS activer en production ! Testez d\'abord dans un Sandbox.',
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Lightbox: click thumbnail to open full-size overlay, click overlay to close. */
function ImageLightbox({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group mt-2 block w-full cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 shadow-sm transition-shadow hover:shadow-md"
      >
        <img
          src={src}
          alt={alt}
          className="w-full rounded-lg object-cover transition-transform group-hover:scale-[1.01]"
        />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl cursor-zoom-out"
          />
        </div>
      )}
    </>
  );
}

function CopyButton({ value, label, copiedLabel = 'Copied!' }: { value: string; label?: string; copiedLabel?: string }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // file:// fallback
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={doCopy}
      className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
      title={`Copy: ${label ?? value}`}
    >
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
      {copied ? copiedLabel : (label ?? (value.length > 40 ? value.slice(0, 37) + '...' : value))}
    </button>
  );
}

interface StepLabels {
  settingLabel: string;
  valueLabel: string;
  markComplete: string;
  completed: string;
  blockerLabel: string;
  copiedLabel: string;
  copyLabel: string;
}

function StepCard({ step, stepNum, labels }: { step: StepData; stepNum: number; labels: StepLabels }) {
  const [expanded, setExpanded] = useState(true);
  const [done, setDone] = useState(false);

  return (
    <div className={`rounded-xl border ${done ? 'border-green-200 bg-green-50/40' : 'border-slate-200 bg-white'} shadow-sm transition-all`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-green-500 text-white' : 'bg-brand-100 text-brand-700'}`}>
          {done ? <CheckCircle2 className="h-4 w-4" /> : stepNum}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-ink">{step.title}</h4>
          {step.where && (
            <p className="mt-0.5 text-xs text-slate-400 font-mono">{step.where}</p>
          )}
          <p className="mt-1 text-sm text-slate-600">{step.summary}</p>
        </div>
        {expanded ? <ChevronDown className="h-5 w-5 mt-1 text-slate-400 shrink-0" /> : <ChevronRight className="h-5 w-5 mt-1 text-slate-400 shrink-0" />}
      </button>

      {/* Body */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
          {/* Instructions */}
          <ol className="space-y-1.5 text-sm text-slate-700 pl-4">
            {step.instructions.map((instr, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-600">{i + 1}</span>
                <span>{instr}</span>
              </li>
            ))}
          </ol>

          {/* Preview image */}
          {step.previewImg && (
            <ImageLightbox src={step.previewImg} alt={step.title} />
          )}

          {/* Values table */}
          {step.values && step.values.length > 0 && (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{labels.settingLabel}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{labels.valueLabel}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {step.values.map((v, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium text-slate-600">{v.field}</td>
                      <td className="px-3 py-2 text-slate-700">
                        {v.copyable ? <CopyButton value={v.value} copiedLabel={labels.copiedLabel} /> : <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{v.value}</code>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Copy blocks */}
          {step.copyBlocks && step.copyBlocks.length > 0 && (
            <div className="space-y-2">
              {step.copyBlocks.map((cb, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-500">{cb.label}</span>
                    <CopyButton value={cb.value} label={labels.copyLabel} copiedLabel={labels.copiedLabel} />
                  </div>
                  <pre className="whitespace-pre-wrap text-xs text-slate-700 font-mono leading-relaxed max-h-48 overflow-y-auto">{cb.value}</pre>
                </div>
              ))}
            </div>
          )}

          {/* Tip */}
          {step.tip && (
            <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-sm text-blue-800">
              <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
              <span>{step.tip}</span>
            </div>
          )}

          {/* Warning */}
          {step.warning && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
              <span>{step.warning}</span>
            </div>
          )}

          {/* Blocker */}
          {step.blocker && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
              <strong className="shrink-0">{labels.blockerLabel}</strong>
              <span>{step.blocker}</span>
            </div>
          )}

          {/* Mark complete */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setDone(!done)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${done ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700'}`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {done ? labels.completed : labels.markComplete}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function BuildFlowGuide() {
  const { navigate } = useRoute();
  const lang = useLanguage();
  const c = content[lang];

  const stepLabels: StepLabels = {
    settingLabel: c.settingLabel,
    valueLabel: c.valueLabel,
    markComplete: c.markComplete,
    completed: c.completed,
    blockerLabel: c.blockerLabel,
    copiedLabel: c.copiedLabel,
    copyLabel: c.copyLabel,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate({ kind: 'home' })}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
        >
          <HomeIcon className="h-4 w-4" aria-hidden="true" />
          {c.homeLabel}
        </button>
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-brand-50 p-2.5 text-brand-600 ring-1 ring-inset ring-brand-100">
            <Workflow className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-ink">{c.pageTitle}</h1>
            <p className="mt-0.5 text-sm text-muted">
              {c.pageSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Flow preview image */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">{c.flowPreviewLabel}</p>
        <img
          src="https://i.postimg.cc/j2htrm0f/Preview.jpg"
          alt="Flow preview — Daily Account Meeting Briefing"
          className="w-full rounded-lg border border-slate-200 shadow-sm"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
          {c.flowPills.map((pill, i) => (
            <span key={i}>
              {i > 0 && <span className="text-brand-400 mr-2">&rarr;</span>}
              <span className="rounded-full bg-white px-3 py-1 border border-brand-200 text-brand-700">{pill}</span>
            </span>
          ))}
          <span className="text-brand-400">&rarr;</span>
          <span className="rounded-full bg-white px-3 py-1 border border-red-200 text-red-700">{c.faultPill}</span>
        </div>
      </div>

      {/* Done when */}
      <div className="mb-5">
        <p className="flex items-start gap-1.5 rounded-lg bg-brand-50 border border-brand-100 px-3 py-2 text-sm text-brand-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span><strong>{c.doneWhenLabel}</strong> {c.doneWhen}</span>
        </p>
      </div>

      {/* Steps */}
      <section>
        <div className="space-y-4">
          {c.steps.map((step, idx) => (
            <StepCard key={step.id} step={step} stepNum={idx + 1} labels={stepLabels} />
          ))}
        </div>
      </section>

      {/* Credit */}
      <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
        <p className="inline-flex items-center gap-1.5">
          Created by{' '}
          <a
            href="https://salesforce.enterprise.slack.com/team/U01G8QJC2AW"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-800 hover:underline"
          >
            <img
              src="https://assets-v2.lottiefiles.com/a/bb1cc7d6-07ca-4b63-807b-7700caf111e0/QYIeYh2AK9.gif"
              alt=""
              className="h-5 w-5"
              aria-hidden="true"
            />
            Patrick Pelot
          </a>
        </p>
      </footer>
    </div>
  );
}
