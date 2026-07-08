// ============================================================================
// French overlay for the Quick Reference tables (best practices, common
// errors, scheduled-flow limits). Applied BY INDEX onto the English arrays in
// quickReference.ts via localizeRows(). Literal numeric limit values and
// English enum values (Daily, Weekly, Once) fall through unchanged because the
// overlay omits them; where a value contains prose it is translated.
// Salesforce API names / paths inside the text stay in English.
// ============================================================================

import type { QuickRefOverlay } from '../lib/localize';

export const quickReferenceOverlay: QuickRefOverlay = {
  bestPractices: [
    {
      practice: 'Ajouter un élément « Decision »',
      why: "Empêche d'écraser le champ avec une valeur vide.",
    },
    {
      practice: 'Mettre en place un chemin d’erreur (Fault Path)',
      why: "Alerte l'admin lorsque la génération du prompt ou la mise à jour échoue.",
    },
    {
      practice: 'Vérifier la présentation de page du Default Workflow User',
      why: 'Le Record Snapshot dépend de cette présentation.',
    },
    {
      practice: 'Planifier en dehors des heures de pointe',
      why: 'Aide à éviter les conflits de verrouillage d’enregistrement.',
    },
    {
      practice: 'Toujours construire d’abord en Sandbox',
      why: 'Évite les erreurs en production.',
    },
    {
      practice: 'Commencer petit avec des filtres restrictifs',
      why: 'Réduit le volume et facilite les tests.',
    },
    {
      practice: 'Ajouter « Do not wrap in code fences » au prompt',
      why: 'Empêche le HTML cassé dans le texte enrichi.',
    },
    {
      practice: "Attribuer les ensembles d'autorisations avant de commencer",
      why: "Requis pour l'accès à Prompt Builder.",
    },
  ],
  commonErrors: [
    {
      error: 'La valeur RelatedEntity a un format incorrect',
      cause: 'Passage de $Record directement au lieu de JSON.',
      fix: 'Utilisez {"Id":"{!$Record.Id}"} en mode texte/formule.',
    },
    {
      error: 'Prompt Builder affiche « Page not found »',
      cause: "Ensembles d'autorisations manquants.",
      fix: 'Attribuez EinsteinGPTPromptTemplateManager et EinsteinGPTPromptTemplateUser.',
    },
    {
      error: 'Le modèle n’apparaît pas dans les actions de Flow Builder',
      cause: "Le modèle n'est pas activé.",
      fix: 'Allez dans Prompt Builder et cliquez sur « Activate ».',
    },
    {
      error: 'Le flux ne s’exécute pas à l’heure prévue',
      cause: 'Décalage de fuseau horaire.',
      fix: "Vérifiez le fuseau horaire de l'org dans Setup > Company Information.",
    },
    {
      error: 'La tâche planifiée n’affiche pas de date « Started »',
      cause: "Le flux n'a pas encore atteint son heure planifiée.",
      fix: 'Attendez, ou réglez sur « Once » avec une heure plus proche.',
    },
    {
      error: 'Le champ texte enrichi affiche des balises HTML brutes',
      cause: 'Le type de champ est « Long Text Area ».',
      fix: 'Recréez le champ en tant que « Rich Text Area ».',
    },
    {
      error: 'Avertissement « Start date is in the past »',
      cause: 'La date de planification est déjà passée.',
      fix: 'Mettez à jour la « Start Date » avec une date future.',
    },
  ],
  limits: [
    { limit: "Nombre max d'enregistrements par exécution" },
    { limit: 'Taille de lot (batch)', value: '200 enregistrements à la fois' },
    { limit: 'Interviews par 24 heures', value: '250 000, ou licences utilisateur × 200' },
    { limit: 'Fréquences disponibles' },
  ],
  limitsNote:
    "Pour de gros volumes, Salesforce prend en charge le traitement par lots des modèles de prompt (« Prompt Template Batch Processing ») pour générer des réponses de manière asynchrone via Flow ou Apex.",
};
