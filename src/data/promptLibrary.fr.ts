// ============================================================================
// French overlay for the Prompt Library cards.
//
// Keyed by the SAME prompt ids as promptLibrary.ts. Only the card-level
// title / description / outputFormat are translated. The prompt `body` (which
// feeds the LLM and contains "The response should be in EN_US" and {!$…} merge
// tokens), plus `tags`, `object` and `grounding`, are omitted so they fall
// through unchanged in English. Output-format strings keep the literal locale
// code "EN_US" verbatim.
// ============================================================================

import type { PromptOverlay } from '../lib/localize';

export const promptLibraryOverlay: Record<string, PromptOverlay> = {
  'account-summary-prompt': {
    title: 'Prompt de résumé de compte',
    description:
      "Prompt généré par l'IA utilisé pour écrire un briefing, résumé ou recommandation.",
    outputFormat: 'Texte enrichi HTML (moins de 200 mots)',
  },
  'super-sales-prompt': {
    title: 'Super Sales Prompt',
    description: 'Note de veille commerciale de niveau Account Executive senior.',
    outputFormat: 'HTML sur une seule ligne, 600 mots max, EN_US',
  },
  'account-summary': {
    title: 'Résumé de compte / Briefing pré-réunion',
    description: 'Générez un briefing de compte complet avant une réunion client.',
    outputFormat: 'HTML sur une seule ligne, EN_US',
  },
  'opportunity-summary': {
    title: "Résumé d'opportunité",
    description:
      "Synthétisez l'étape du deal, les prochaines actions, l'engagement des parties prenantes et les risques.",
    outputFormat: 'HTML sur une seule ligne, EN_US',
  },
  'prospecting-email': {
    title: 'E-mail de prospection personnalisé',
    description:
      "Rédigez un e-mail de premier contact personnalisé et recommandez le meilleur moment pour l'envoyer.",
    outputFormat:
      'Texte brut (objet, salutation, corps, formule de politesse, fenêtre de contact)',
  },
  'meeting-preparation': {
    title: 'Préparation de réunion',
    description:
      "Consolidez l'historique du compte, les opportunités ouvertes, les interactions récentes et les points de discussion.",
    outputFormat: 'HTML sur une seule ligne, EN_US',
  },
  'pipeline-health': {
    title: 'Suivi de la santé du pipeline',
    description:
      'Détectez les deals bloqués, suggérez les prochaines actions et générez des conseils de suivi.',
    outputFormat: 'HTML sur une seule ligne, EN_US',
  },
  'white-space-upsell': {
    title: 'Analyse d’espace inexploité / Montée en gamme',
    description:
      "Comparez l'adoption des produits et les droits contractuels pour identifier des opportunités d'expansion.",
    outputFormat: 'HTML sur une seule ligne, EN_US',
  },
  'lead-qualification': {
    title: 'Qualification et scoring des pistes',
    description:
      'Évaluez les pistes entrantes selon les critères ICP et recommandez un routage.',
    outputFormat: 'HTML sur une seule ligne, EN_US',
  },
  'activity-capture': {
    title: "Capture et journalisation d'activité",
    description:
      "Filtrez les interactions e-mail et agenda pour ne journaliser que les activités stratégiques.",
    outputFormat: 'HTML sur une seule ligne, EN_US',
  },
};
