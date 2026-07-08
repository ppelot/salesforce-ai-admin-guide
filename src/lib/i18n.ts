// ============================================================================
// UI string dictionary (chrome/labels) + language hooks.
//
// Guide CONTENT (steps, prompts, troubleshooting, quick reference) is localized
// separately via overlays in src/data/ — see localize.ts. This file covers only
// the app chrome: buttons, headings, labels, aria text.
//
// `en` is the source of truth for the key set; `fr` is typed as
// Record<UIKey,string>, so the compiler rejects any missing or extra French
// key — EN/FR parity is enforced at build time.
// ============================================================================

import type { Language, PromptTag } from './types';
import { useAppState } from './state';

// ---------------------------------------------------------------------------
// English (source key set).
// ---------------------------------------------------------------------------

const en = {
  // Header / shell
  'mode.group': 'Detail level',
  'mode.beginner': 'Beginner',
  'mode.compact': 'Compact',
  'header.searchLabel': 'Search the guide',
  'header.searchPlaceholder': 'Search…',
  'reset.confirm': 'Reset all progress, notes, and checklists? This cannot be undone.',
  'reset.title': 'Reset all saved progress',
  'reset.label': 'Reset',
  'header.brand': 'SF AI Admin Guide',
  'nav.primary': 'Primary',
  'nav.home': 'Home',
  'nav.library': 'Library',
  'nav.troubleshoot': 'Troubleshoot',
  'lang.group': 'Language',
  'lang.fr': 'FR',
  'lang.en': 'EN',
  'lang.frFull': 'Français',
  'lang.enFull': 'English',
  'skipLink': 'Skip to main content',
  'footer.tagline':
    'Runs fully offline · Progress saved in your browser · No data leaves this device',
  'docTitle.base': 'Salesforce AI Admin Setup Guide',
  'docTitle.library': 'Prompt Library',
  'docTitle.troubleshoot': 'Troubleshooting',
  'docTitle.validate': 'Validation',
  'docTitle.search': 'Search',
  'docTitle.print': 'Print',

  // Home
  'home.badge': 'Automated AI Use Case',
  'home.h1': 'Automated AI Use Case Admin Guide',
  'home.subtitle':
    'Activate Agentforce Coworker and build personalized AI prompts in Salesforce.',
  'home.choosePath':
    'Choose a path below. You can complete either path independently or do both.',
  'home.percentDone': '{percent}% done',
  'home.difficulty': 'Difficulty:',
  'home.includes': 'Includes:',
  'home.resume': 'Resume path',
  'home.start': 'Start this path',
  'home.firstHeading': 'What should I do first?',
  'home.first1': 'If the org is {s}, start with Agentforce Coworker.',
  'home.first1.s': 'not prepared for Agentforce',
  'home.first2': 'If {s}, start with Personalized AI Prompts.',
  'home.first2.s': 'Agentforce / Einstein is already enabled',
  'home.first3': 'Always {s} before Production.',
  'home.first3.s': 'test automation in Sandbox',
  'home.tile.library.title': 'Prompt Library',
  'home.tile.library.sub': '10 ready-to-use templates',
  'home.tile.troubleshoot.title': 'Troubleshooting',
  'home.tile.troubleshoot.sub': 'Symptom → cause → fix',
  'home.tile.search.title': 'Search everything',
  'home.tile.search.sub': 'Steps, prompts, errors, terms',

  // Journey wizard
  'journey.home': 'Home',
  'journey.stepsComplete': '{completed} of {total} steps complete',
  'journey.sectionsNav': 'Journey sections',
  'journey.doneWhen': 'Done when:',
  'journey.emptySection':
    'This section has no step-by-step actions — review the notes above.',
  'journey.previous': 'Previous',
  'journey.print': 'Print',
  'journey.validation': 'Validation',
  'journey.next': 'Next',
  'journey.finish': 'Finish & validate',
  'journey.phaseBadge': 'Phase {n}',
  'journey.progressAria': '{title} progress',
  'journey.announce': 'Now on {title}',

  // Step card
  'gating.required': 'Required',
  'gating.recommended': 'Recommended',
  'gating.optional': 'Optional',
  'step.completed': 'Completed',
  'step.markComplete': 'Mark complete',
  'step.done': 'Done',
  'step.instructions': 'Instructions',
  'step.whatToEnter': 'What to enter',
  'step.passCriteria': 'Pass criteria',
  'step.whyMatters': 'Why this matters',
  'step.myNotes': 'My notes',
  'step.notesPlaceholder': 'Jot down org-specific values, blockers, or reminders…',

  // Checklist
  'gonogo.go': 'Go',
  'gonogo.partial': 'In progress',
  'gonogo.noGo': 'Not started',
  'checklist.phase': 'Phase checklist',
  'checklist.section': 'Section checklist',
  'checklist.required': 'Required',
  'checklist.ready': 'Ready — all required items complete.',

  // Progress panel
  'progress.title': 'Progress',
  'progress.completed': '{n} completed',
  'progress.remaining': '{n} remaining',
  'progress.openWarnings': 'Open warnings',
  'progress.noWarnings': 'No open warnings. Nice work.',
  'progress.more': '+{n} more',
  'progress.readyQuestion': 'Ready for validation?',
  'progress.ready': 'Ready',
  'progress.notYet': 'Not yet',
  'progress.openValidation': 'Open validation',
  'progress.panelAria': 'Progress panel',

  // Search
  'search.type.step': 'Step',
  'search.type.section': 'Section',
  'search.type.navPath': 'Setup path',
  'search.type.apiName': 'API name',
  'search.type.prompt': 'Prompt',
  'search.type.troubleshooting': 'Troubleshooting',
  'search.h1': 'Search the guide',
  'search.inputLabel': 'Search steps, prompts, errors, and Setup paths',
  'search.placeholder':
    'Try “permission set”, “rich text”, “schedule”, “EinsteinGPT”…',
  'search.empty':
    'Search across every step, prompt, troubleshooting entry, Setup path, and API name.',
  'search.resultsOne': '{n} result for “{q}”.',
  'search.resultsMany': '{n} results for “{q}”.',
  'search.noMatches':
    'No matches. Try fewer or different words — search matches all typed words.',

  // Prompt library
  'library.notFound': 'That prompt could not be found.',
  'library.backToLibrary': 'Back to the library',
  'library.allPrompts': 'All prompts',
  'library.object': 'Object',
  'library.output': 'Output',
  'library.grounding': 'Grounding',
  'library.template': 'Prompt template',
  'library.h1': 'Prompt Library',
  'library.intro':
    '{n} ready-to-use prompt templates for Prompt Builder. Copy a template as-is, or open one to customize object, tone, language, and length.',
  'library.filterByTag': 'Filter prompts by tag',
  'library.all': 'All ({n})',
  'library.openCustomize': 'Open & customize',
  'library.copyTemplate': 'Copy template',

  // Prompt customizer
  'cz.tone.concise': 'Concise',
  'cz.tone.executive': 'Executive',
  'cz.tone.beginner-friendly': 'Beginner-friendly',
  'cz.tone.persuasive': 'Persuasive',
  'cz.output.html': 'HTML rich text',
  'cz.output.plain': 'Plain text',
  'cz.title': 'Customize this prompt',
  'cz.helper':
    'Adjust the options below to tailor the prompt. This runs entirely in your browser — no AI is called. Salesforce merge fields stay untouched.',
  'cz.targetObject': 'Target object',
  'cz.language': 'Language',
  'cz.tone': 'Tone',
  'cz.outputFormat': 'Output format',
  'cz.wordLimit': 'Word limit',
  'cz.optional': '(optional)',
  'cz.wordLimitPlaceholder': 'e.g. 200 — leave blank for no limit',
  'cz.mergeFields': 'Salesforce merge fields (kept exactly as-is)',
  'cz.livePreview': 'Customized prompt (live preview)',
  'cz.customizedSuffix': 'customized',
  'cz.howToUse': 'How to use it',
  'cz.howToUseBody':
    'Paste this into your Prompt Template body in Prompt Builder. The merge fields (e.g. {s}) resolve inside Salesforce — keep them exactly as shown.',

  // Troubleshooting
  'ts.journeyLabel.agentforce': 'Agentforce',
  'ts.journeyLabel.prompts': 'Prompt Flow',
  'ts.journeyLabel.both': 'Both',
  'ts.likelyCause': 'Likely cause',
  'ts.howToFix': 'How to fix it',
  'ts.goToStep': 'Go to the related step',
  'ts.h1': 'Troubleshooting assistant',
  'ts.helper':
    "Pick the symptom you're seeing to get the likely cause, the fix, and a jump to the related step.",
  'ts.filterByJourney': 'Filter by journey',
  'ts.filter.all': 'All',
  'ts.view.assistant': 'Assistant',
  'ts.view.table': 'Table',
  'ts.symptomQuestion': "What's the symptom?",
  'ts.noEntries': 'No entries for this filter.',
  'ts.col.symptom': 'Symptom',
  'ts.col.cause': 'Cause',
  'ts.col.fix': 'Fix',
  'ts.col.error': 'Error',
  'ts.quickRef': 'Quick reference',
  'ts.bestPractices': 'Best practices',
  'ts.limits': 'Scheduled flow limits',
  'ts.commonErrorsCaption': 'Common errors, causes, and fixes',

  // Validation dashboard
  'val.gonogo.go': 'Go',
  'val.gonogo.partial': 'Almost there',
  'val.gonogo.noGo': 'Not verified',
  'val.backTo': 'Back to {title}',
  'val.h1': 'Validation',
  'val.subtitle': '{title} — confirm everything works end to end.',
  'val.status': 'Validation status',
  'val.checksVerified': '{verified} of {total} checks verified',
  'val.tip':
    "Tip: some setup steps aren't marked complete yet. You can still verify here, but finishing the steps first is recommended.",
  'val.completionAria': 'Validation completion',
  'val.how': 'How: ',
  'val.reviewStep': 'Review the related step',
  'val.allPassed': 'All checks passed — {title} is validated.',
  'val.allPassedSub': 'Everything is verified end to end. Nice work.',
  'val.backToSteps': 'Back to steps',
  'val.printChecklist': 'Print checklist',

  // Print view
  'print.docHeader': 'Salesforce AI Admin Setup Guide',
  'print.backTo': 'Back to {title}',
  'print.printSave': 'Print / Save as PDF',
  'print.phase': 'Phase {n}: ',
  'print.doneWhen': 'Done when:',
  'print.where': 'Where:',
  'print.quickFind': 'Quick Find:',
  'print.passCriteria': 'Pass criteria:',
  'print.blocker': 'Blocker',
  'print.warning': 'Warning',
  'print.checklist': 'Checklist',
  'print.required': '(required)',
  'print.validationChecklist': 'Validation checklist',

  // Callout default titles
  'callout.info': 'Note',
  'callout.tip': 'Beginner tip',
  'callout.warning': 'Warning',
  'callout.blocker': 'Common blocker',

  // Disclaimer
  'disclaimer.text':
    "Salesforce product names, menus, and feature availability can change. Always confirm against current Salesforce Help and your org's licenses. This guide is based on the source admin document and does not require Salesforce API access.",

  // Nav path display
  'navpath.whereToClick': 'Where to click in Salesforce',
  'navpath.pathAria': 'Salesforce Setup navigation path',
  'navpath.quickFindTerm': 'Quick Find search term',

  // Copy controls
  'copy.copy': 'Copy',
  'copy.copied': 'Copied!',
  'copy.copyLabel': 'Copy {label}',
  'copy.copiedToClipboard': '{label} copied to clipboard',
} as const;

export type UIKey = keyof typeof en;

// ---------------------------------------------------------------------------
// French (must define exactly the same keys — enforced by the type).
// Salesforce literals inside strings (API names, Setup paths, {!$…} tokens)
// are intentionally left in English.
// ---------------------------------------------------------------------------

const fr: Record<UIKey, string> = {
  // Header / shell
  'mode.group': 'Niveau de détail',
  'mode.beginner': 'Débutant',
  'mode.compact': 'Compact',
  'header.searchLabel': 'Rechercher dans le guide',
  'header.searchPlaceholder': 'Rechercher…',
  'reset.confirm':
    'Réinitialiser toute la progression, les notes et les listes de contrôle ? Cette action est irréversible.',
  'reset.title': 'Réinitialiser toute la progression enregistrée',
  'reset.label': 'Réinitialiser',
  'header.brand': 'Guide Admin IA SF',
  'nav.primary': 'Principale',
  'nav.home': 'Accueil',
  'nav.library': 'Bibliothèque',
  'nav.troubleshoot': 'Dépannage',
  'lang.group': 'Langue',
  'lang.fr': 'FR',
  'lang.en': 'EN',
  'lang.frFull': 'Français',
  'lang.enFull': 'English',
  'skipLink': 'Aller au contenu principal',
  'footer.tagline':
    'Fonctionne entièrement hors ligne · Progression enregistrée dans votre navigateur · Aucune donnée ne quitte cet appareil',
  'docTitle.base': "Guide d'administration Salesforce IA",
  'docTitle.library': 'Bibliothèque de prompts',
  'docTitle.troubleshoot': 'Dépannage',
  'docTitle.validate': 'Validation',
  'docTitle.search': 'Recherche',
  'docTitle.print': 'Impression',

  // Home
  'home.badge': "Cas d'usage IA automatisé",
  'home.h1': "Guide d'administration : cas d'usage IA automatisé",
  'home.subtitle':
    'Activez Agentforce Coworker et créez des prompts IA personnalisés dans Salesforce.',
  'home.choosePath':
    'Choisissez un parcours ci-dessous. Vous pouvez suivre chaque parcours indépendamment ou les deux.',
  'home.percentDone': '{percent}% terminé',
  'home.difficulty': 'Difficulté :',
  'home.includes': 'Comprend :',
  'home.resume': 'Reprendre le parcours',
  'home.start': 'Commencer ce parcours',
  'home.firstHeading': 'Par où commencer ?',
  'home.first1': "Si l'org {s}, commencez par Agentforce Coworker.",
  'home.first1.s': "n'est pas prête pour Agentforce",
  'home.first2': 'Si {s}, commencez par les Prompts IA personnalisés.',
  'home.first2.s': 'Agentforce / Einstein est déjà activé',
  'home.first3': 'Toujours {s} avant la Production.',
  'home.first3.s': "tester l'automatisation dans une Sandbox",
  'home.tile.library.title': 'Bibliothèque de prompts',
  'home.tile.library.sub': "10 modèles prêts à l'emploi",
  'home.tile.troubleshoot.title': 'Dépannage',
  'home.tile.troubleshoot.sub': 'Symptôme → cause → solution',
  'home.tile.search.title': 'Tout rechercher',
  'home.tile.search.sub': 'Étapes, prompts, erreurs, termes',

  // Journey wizard
  'journey.home': 'Accueil',
  'journey.stepsComplete': '{completed} étapes sur {total} terminées',
  'journey.sectionsNav': 'Sections du parcours',
  'journey.doneWhen': 'Terminé lorsque :',
  'journey.emptySection':
    'Cette section ne comporte pas d’actions étape par étape — consultez les notes ci-dessus.',
  'journey.previous': 'Précédent',
  'journey.print': 'Imprimer',
  'journey.validation': 'Validation',
  'journey.next': 'Suivant',
  'journey.finish': 'Terminer et valider',
  'journey.phaseBadge': 'Phase {n}',
  'journey.progressAria': 'Progression : {title}',
  'journey.announce': 'Section actuelle : {title}',

  // Step card
  'gating.required': 'Obligatoire',
  'gating.recommended': 'Recommandé',
  'gating.optional': 'Facultatif',
  'step.completed': 'Terminé',
  'step.markComplete': 'Marquer comme terminé',
  'step.done': 'Fait',
  'step.instructions': 'Instructions',
  'step.whatToEnter': 'Que saisir',
  'step.passCriteria': 'Critères de réussite',
  'step.whyMatters': "Pourquoi c'est important",
  'step.myNotes': 'Mes notes',
  'step.notesPlaceholder':
    'Notez des valeurs propres à votre org, des blocages ou des rappels…',

  // Checklist
  'gonogo.go': 'Prêt',
  'gonogo.partial': 'En cours',
  'gonogo.noGo': 'Non commencé',
  'checklist.phase': 'Liste de contrôle de la phase',
  'checklist.section': 'Liste de contrôle de la section',
  'checklist.required': 'Obligatoire',
  'checklist.ready': 'Prêt — tous les éléments obligatoires sont terminés.',

  // Progress panel
  'progress.title': 'Progression',
  'progress.completed': '{n} terminées',
  'progress.remaining': '{n} restantes',
  'progress.openWarnings': 'Avertissements ouverts',
  'progress.noWarnings': 'Aucun avertissement ouvert. Beau travail.',
  'progress.more': '+{n} de plus',
  'progress.readyQuestion': 'Prêt pour la validation ?',
  'progress.ready': 'Prêt',
  'progress.notYet': 'Pas encore',
  'progress.openValidation': 'Ouvrir la validation',
  'progress.panelAria': 'Panneau de progression',

  // Search
  'search.type.step': 'Étape',
  'search.type.section': 'Section',
  'search.type.navPath': 'Chemin Setup',
  'search.type.apiName': "Nom d'API",
  'search.type.prompt': 'Prompt',
  'search.type.troubleshooting': 'Dépannage',
  'search.h1': 'Rechercher dans le guide',
  'search.inputLabel': 'Rechercher étapes, prompts, erreurs et chemins Setup',
  'search.placeholder':
    'Essayez « ensemble d’autorisations », « texte enrichi », « planification », « EinsteinGPT »…',
  'search.empty':
    "Recherchez dans chaque étape, prompt, entrée de dépannage, chemin Setup et nom d'API.",
  'search.resultsOne': '{n} résultat pour « {q} ».',
  'search.resultsMany': '{n} résultats pour « {q} ».',
  'search.noMatches':
    'Aucun résultat. Essayez moins de mots ou d’autres termes — la recherche exige tous les mots saisis.',

  // Prompt library
  'library.notFound': 'Ce prompt est introuvable.',
  'library.backToLibrary': 'Retour à la bibliothèque',
  'library.allPrompts': 'Tous les prompts',
  'library.object': 'Objet',
  'library.output': 'Sortie',
  'library.grounding': 'Ancrage (grounding)',
  'library.template': 'Modèle de prompt',
  'library.h1': 'Bibliothèque de prompts',
  'library.intro':
    "{n} modèles de prompts prêts à l'emploi pour Prompt Builder. Copiez un modèle tel quel, ou ouvrez-en un pour personnaliser l'objet, le ton, la langue et la longueur.",
  'library.filterByTag': 'Filtrer les prompts par tag',
  'library.all': 'Tous ({n})',
  'library.openCustomize': 'Ouvrir et personnaliser',
  'library.copyTemplate': 'Copier le modèle',

  // Prompt customizer
  'cz.tone.concise': 'Concis',
  'cz.tone.executive': 'Exécutif',
  'cz.tone.beginner-friendly': 'Accessible aux débutants',
  'cz.tone.persuasive': 'Persuasif',
  'cz.output.html': 'Texte enrichi HTML',
  'cz.output.plain': 'Texte brut',
  'cz.title': 'Personnaliser ce prompt',
  'cz.helper':
    "Ajustez les options ci-dessous pour adapter le prompt. Tout se passe dans votre navigateur — aucune IA n'est appelée. Les champs de fusion Salesforce restent intacts.",
  'cz.targetObject': 'Objet cible',
  'cz.language': 'Langue',
  'cz.tone': 'Ton',
  'cz.outputFormat': 'Format de sortie',
  'cz.wordLimit': 'Limite de mots',
  'cz.optional': '(facultatif)',
  'cz.wordLimitPlaceholder': 'ex. 200 — laisser vide pour aucune limite',
  'cz.mergeFields': 'Champs de fusion Salesforce (conservés tels quels)',
  'cz.livePreview': 'Prompt personnalisé (aperçu en direct)',
  'cz.customizedSuffix': 'personnalisé',
  'cz.howToUse': "Comment l'utiliser",
  'cz.howToUseBody':
    'Collez ceci dans le corps de votre modèle de prompt dans Prompt Builder. Les champs de fusion (ex. {s}) se résolvent dans Salesforce — conservez-les exactement tels quels.',

  // Troubleshooting
  'ts.journeyLabel.agentforce': 'Agentforce',
  'ts.journeyLabel.prompts': 'Flux de prompt',
  'ts.journeyLabel.both': 'Les deux',
  'ts.likelyCause': 'Cause probable',
  'ts.howToFix': 'Comment résoudre',
  'ts.goToStep': "Aller à l'étape associée",
  'ts.h1': 'Assistant de dépannage',
  'ts.helper':
    "Choisissez le symptôme observé pour obtenir la cause probable, la solution et un lien vers l'étape associée.",
  'ts.filterByJourney': 'Filtrer par parcours',
  'ts.filter.all': 'Tous',
  'ts.view.assistant': 'Assistant',
  'ts.view.table': 'Tableau',
  'ts.symptomQuestion': 'Quel est le symptôme ?',
  'ts.noEntries': 'Aucune entrée pour ce filtre.',
  'ts.col.symptom': 'Symptôme',
  'ts.col.cause': 'Cause',
  'ts.col.fix': 'Solution',
  'ts.col.error': 'Erreur',
  'ts.quickRef': 'Référence rapide',
  'ts.bestPractices': 'Bonnes pratiques',
  'ts.limits': 'Limites des flux planifiés',
  'ts.commonErrorsCaption': 'Erreurs courantes, causes et solutions',

  // Validation dashboard
  'val.gonogo.go': 'Prêt',
  'val.gonogo.partial': 'Presque prêt',
  'val.gonogo.noGo': 'Non vérifié',
  'val.backTo': 'Retour à {title}',
  'val.h1': 'Validation',
  'val.subtitle': '{title} — vérifiez que tout fonctionne de bout en bout.',
  'val.status': 'Statut de validation',
  'val.checksVerified': '{verified} vérifications sur {total} effectuées',
  'val.tip':
    'Astuce : certaines étapes de configuration ne sont pas encore marquées comme terminées. Vous pouvez tout de même valider ici, mais il est recommandé de terminer les étapes d’abord.',
  'val.completionAria': 'Achèvement de la validation',
  'val.how': 'Comment : ',
  'val.reviewStep': "Revoir l'étape associée",
  'val.allPassed': 'Toutes les vérifications sont réussies — {title} est validé.',
  'val.allPassedSub': 'Tout est vérifié de bout en bout. Beau travail.',
  'val.backToSteps': 'Retour aux étapes',
  'val.printChecklist': 'Imprimer la liste',

  // Print view
  'print.docHeader': "Guide d'administration Salesforce IA",
  'print.backTo': 'Retour à {title}',
  'print.printSave': 'Imprimer / Enregistrer en PDF',
  'print.phase': 'Phase {n} : ',
  'print.doneWhen': 'Terminé lorsque :',
  'print.where': 'Où :',
  'print.quickFind': 'Recherche rapide :',
  'print.passCriteria': 'Critères de réussite :',
  'print.blocker': 'Blocage',
  'print.warning': 'Avertissement',
  'print.checklist': 'Liste de contrôle',
  'print.required': '(obligatoire)',
  'print.validationChecklist': 'Liste de validation',

  // Callout default titles
  'callout.info': 'Note',
  'callout.tip': 'Conseil pour débutant',
  'callout.warning': 'Avertissement',
  'callout.blocker': 'Blocage fréquent',

  // Disclaimer
  'disclaimer.text':
    "Les noms de produits, menus et disponibilités de fonctionnalités Salesforce peuvent changer. Vérifiez toujours dans l'aide Salesforce actuelle et selon les licences de votre org. Ce guide est basé sur le document d'administration source et ne nécessite pas d'accès à l'API Salesforce.",

  // Nav path display
  'navpath.whereToClick': 'Où cliquer dans Salesforce',
  'navpath.pathAria': 'Chemin de navigation Salesforce Setup',
  'navpath.quickFindTerm': 'Terme de recherche rapide',

  // Copy controls
  'copy.copy': 'Copier',
  'copy.copied': 'Copié !',
  'copy.copyLabel': 'Copier {label}',
  'copy.copiedToClipboard': '{label} copié dans le presse-papiers',
};

export const UI: Record<Language, Record<UIKey, string>> = { en, fr };

// ---------------------------------------------------------------------------
// Prompt-tag display labels. The KEY (English PromptTag) stays the filter
// value; only the visible label is localized.
// ---------------------------------------------------------------------------

const TAG_LABELS: Record<Language, Record<PromptTag, string>> = {
  en: {
    Sales: 'Sales',
    Opportunity: 'Opportunity',
    'Prospecting Email': 'Prospecting Email',
    'Meeting Preparation': 'Meeting Preparation',
    'Pipeline Health': 'Pipeline Health',
    'White Space / Upsell': 'White Space / Upsell',
    'Lead Qualification': 'Lead Qualification',
    'Activity Capture': 'Activity Capture',
    Account: 'Account',
  },
  fr: {
    Sales: 'Ventes',
    Opportunity: 'Opportunité',
    'Prospecting Email': 'E-mail de prospection',
    'Meeting Preparation': 'Préparation de réunion',
    'Pipeline Health': 'Santé du pipeline',
    'White Space / Upsell': 'Espace inexploité / Montée en gamme',
    'Lead Qualification': 'Qualification de piste',
    'Activity Capture': "Capture d'activité",
    Account: 'Compte',
  },
};

export function tagLabel(lang: Language, tag: string): string {
  return TAG_LABELS[lang][tag as PromptTag] ?? tag;
}

// ---------------------------------------------------------------------------
// Interpolation + hooks.
// ---------------------------------------------------------------------------

export type TParams = Record<string, string | number>;

/** Replace {token} placeholders present in `params`; leave others untouched. */
function format(template: string, params?: TParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole,
  );
}

export function translate(lang: Language, key: UIKey, params?: TParams): string {
  const table = UI[lang] ?? UI.fr;
  return format(table[key] ?? UI.en[key] ?? key, params);
}

/** Current UI language from app state (defaults to French). */
export function useLanguage(): Language {
  return useAppState().language;
}

export type TFn = (key: UIKey, params?: TParams) => string;

/** Returns a `t()` bound to the current language. */
export function useT(): TFn {
  const lang = useLanguage();
  return (key: UIKey, params?: TParams) => translate(lang, key, params);
}
