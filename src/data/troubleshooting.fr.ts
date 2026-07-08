// ============================================================================
// French overlay for troubleshooting entries.
//
// Keyed by the SAME ids as troubleshooting.ts. symptom / cause / fix are
// translated; literal Salesforce API names, Setup paths and JSON values are
// kept verbatim in English inside the French text (e.g.
// EinsteinGPTPromptTemplateManager, Setup > Company Information > Default Time
// Zone, {"Id":"{!$Record.Id}"}). journeyId / relatedStepId / tags are omitted
// so they fall through unchanged.
// ============================================================================

import type { TroubleshootingOverlay } from '../lib/localize';

export const troubleshootingOverlay: Record<string, TroubleshootingOverlay> = {
  // --- Journey 1: Agentforce Coworker -------------------------------------
  'ts-af-button': {
    symptom: 'Le bouton Coworker n’apparaît pas',
    cause:
      "L'étape d'expérience utilisateur final est peut-être incomplète, ou l'utilisateur est dans la mauvaise application.",
    fix: "Assurez-vous que l'étape 6 a été effectuée — en particulier le clic sur « Manage » et l'acceptation des conditions de la bêta. Confirmez que l'utilisateur est dans une « Sales Console » ou « Service Console », et non dans une application Lightning standard. Essayez un rafraîchissement forcé.",
  },
  'ts-af-toggle': {
    symptom: 'Le bouton Agentforce n’est pas visible dans Agent Studio',
    cause: "Einstein AI n'a pas été activé.",
    fix: "Einstein AI doit être activé en premier. Allez dans « Einstein Setup », activez-le, puis actualisez.",
  },
  'ts-af-greyed': {
    symptom: 'Le bouton « Turn On » est grisé',
    cause: "Data Cloud n'a pas terminé son provisionnement.",
    fix: "Retournez à « Data Cloud Setup Home » et attendez la fin du provisionnement, puis revenez.",
  },
  'ts-af-permsets': {
    symptom: "Les ensembles d'autorisations ne sont pas visibles",
    cause: "L'org utilise peut-être encore l'ancienne dénomination des ensembles d'autorisations.",
    fix: "Recherchez « Ask Agentforce » — les ensembles d'autorisations peuvent encore utiliser l'ancien nom.",
  },
  'ts-af-license': {
    symptom: 'Erreurs de licence',
    cause: "La licence de l'org n'inclut peut-être pas Agentforce Coworker.",
    fix: "Contactez votre Account Executive ou Customer Success Manager Salesforce pour vérifier que la licence inclut Agentforce Coworker.",
  },

  // --- Journey 2: Prompt Flow ---------------------------------------------
  'ts-p-relatedentity': {
    symptom: 'La valeur RelatedEntity a un format incorrect',
    cause: 'Passage de $Record directement au lieu de JSON.',
    fix: 'Passez le champ en mode texte/formule et saisissez {"Id":"{!$Record.Id}"} manuellement.',
  },
  'ts-p-pagenotfound': {
    symptom: 'Prompt Builder affiche « Page not found »',
    cause: "Ensembles d'autorisations manquants.",
    fix: 'Attribuez EinsteinGPTPromptTemplateManager et EinsteinGPTPromptTemplateUser à votre utilisateur.',
  },
  'ts-p-notinflow': {
    symptom: 'Le modèle n’apparaît pas dans les actions de Flow Builder',
    cause: "Le modèle n'est pas activé.",
    fix: 'Allez dans Prompt Builder et cliquez sur « Activate » sur le modèle.',
  },
  'ts-p-timezone': {
    symptom: 'Le flux ne s’exécute pas à l’heure prévue',
    cause: 'Décalage de fuseau horaire.',
    fix: "Vérifiez le fuseau horaire de l'org dans Setup > Company Information > Default Time Zone.",
  },
  'ts-p-nostarted': {
    symptom: 'La tâche planifiée n’affiche pas de date « Started »',
    cause: "Le flux n'a pas encore atteint son heure planifiée.",
    fix: 'Attendez, ou réglez le flux sur « Once » avec une heure plus proche.',
  },
  'ts-p-rawhtml': {
    symptom: 'Le champ texte enrichi affiche des balises HTML brutes',
    cause: 'Le type de champ est « Long Text Area ».',
    fix: 'Recréez le champ en tant que « Rich Text Area ».',
  },
  'ts-p-pastdate': {
    symptom: 'Avertissement « Start date is in the past »',
    cause: 'La date de planification est déjà passée.',
    fix: 'Mettez à jour la « Start Date » avec une date future.',
  },
};
