// ============================================================================
// French overlay for Journey 2 — Use Personalized AI Prompts.
//
// Sparse overlay keyed by the SAME ids as promptSetupSteps.ts. Only
// human-readable prose is translated. Salesforce literals fall through to
// English because the overlay omits them: navPath segments/Quick Find, API &
// permission-set names, flow references, JSON inputs, global constants, object
// names, enum values (Daily, Account, All Conditions Are Met…), the prompt body
// text, and copy-block VALUES. valuesToEnter rows are merged BY INDEX — a row
// with only `field` translates the label and keeps the English literal value;
// an empty `{}` keeps both English (used for pure Salesforce UI labels/values).
// Salesforce UI control names, page names and buttons are quoted « » in English.
// ============================================================================

import type { JourneyOverlay } from '../lib/localize';

export const promptsOverlay: JourneyOverlay = {
  title: 'Utiliser des prompts IA personnalisés',
  tagline:
    'Créez un briefing de réunion de compte à l’aide de Prompt Builder et d’un flux déclenché par planification.',
  difficulty: 'Admin débutant à intermédiaire',
  purpose:
    "Planifiez des flux automatisés qui exploitent l'IA Salesforce (Prompt Builder) pour générer des briefings, résumés et recommandations — puis stockez les résultats directement sur vos enregistrements.",
  includes: [
    'Autorisations',
    'Champ texte enrichi',
    'Record snapshot',
    'Modèle de prompt',
    'Flux',
    'Test',
    'Surveillance',
  ],
  sections: {
    // ------------------------------------------------------- Phase 0
    'phase-0': {
      title: 'Prérequis',
      doneWhen:
        "L'édition, Einstein, les ensembles d'autorisations, le Default Workflow User et le plan de champ sont confirmés.",
      intro:
        'Un point de contrôle « go / no-go ». Confirmez chaque élément ci-dessous avant de construire quoi que ce soit — chacun bloque Prompt Builder ou le flux s’il manque.',
      steps: {
        'p0-gonogo': {
          title: 'Liste de contrôle « Go / No-Go »',
          compactLabel: 'Confirmer les prérequis',
          summary:
            "Confirmez l'édition de votre org, Einstein, les ensembles d'autorisations, le Default Workflow User et le plan du champ personnalisé.",
          valuesToEnter: [
            { field: 'Édition' },
            { field: 'Einstein', value: 'Activé dans Setup > Einstein Setup' },
            { field: "Ensemble d'autorisations" },
            { field: "Ensemble d'autorisations" },
            {
              field: 'Default Workflow User',
              value: 'Configuré dans Setup > Process Automation Settings',
            },
            {
              field: 'Champ personnalisé',
              value: 'Créez un champ Rich Text Area sur l\'objet cible de votre prompt (ex : Account_Meeting_Briefing__c sur Compte pour un briefing meeting)',
            },
          ],
          whyItMatters:
            "L'absence d'un prérequis provoque des échecs déroutants plus tard — un « Page not found » dans Prompt Builder, ou un flux qui s'exécute en tant que mauvais utilisateur et ne voit aucune donnée.",
        },
        'p0-assign-permsets': {
          title: "Attribuer les ensembles d'autorisations",
          compactLabel: "Attribuer les ensembles d'autorisations Prompt Template",
          summary:
            "Attribuez les deux ensembles d'autorisations EinsteinGPT Prompt Template à votre utilisateur pour que Prompt Builder s'ouvre.",
          instructions: [
            'Allez dans Setup > Permission Sets.',
            'Recherchez EinsteinGPTPromptTemplateManager.',
            "Ouvrez l'ensemble d'autorisations.",
            'Cliquez sur « Manage Assignments ».',
            'Ajoutez votre utilisateur.',
            'Répétez pour EinsteinGPTPromptTemplateUser.',
          ],
          copyBlocks: {
            'p0-ps-manager': "Ensemble d'autorisations (Manager)",
            'p0-ps-user': "Ensemble d'autorisations (Utilisateur)",
          },
          whyItMatters:
            "Ces deux ensembles d'autorisations donnent accès à Prompt Builder et aux modèles qu'il gère.",
          warnings: {
            'p0-ps-w1': {
              title: "Ensembles d'autorisations manquants → « Page not found »",
              body: "Sans ces ensembles d'autorisations, Prompt Builder peut afficher « Page not found ».",
            },
          },
        },
        'p0-default-workflow-user': {
          title: 'Comprendre le Default Workflow User',
          compactLabel: 'Vérifier le Default Workflow User',
          summary:
            "Pour les flux en version d'API 53.0+, le flux s'exécute en tant que Default Workflow User — et cet utilisateur détermine les données que le Record Snapshot peut voir.",
          instructions: [
            'Ouvrez Setup > Process Automation Settings.',
            'Notez le Default Workflow User.',
            "Retenez : c'est cet utilisateur (et non « Automated Process ») en tant que qui le flux planifié s'exécute.",
          ],
          whyItMatters:
            "Le Default Workflow User détermine quels champs et listes associées du compte le Record Snapshot peut lire. Si cet utilisateur ne voit pas un champ, le prompt ne le reçoit jamais.",
          beginnerTip:
            "Pour les flux en version d'API 53.0 et ultérieure, le flux s'exécute en tant que Default Workflow User, et non en tant qu'utilisateur « Automated Process ».",
        },
      },
      checklist: {
        'p0-ck-edition':
          "L'édition de l'org est Enterprise, Unlimited ou Performance.",
        'p0-ck-einstein': 'Einstein est activé.',
        'p0-ck-permsets':
          'EinsteinGPTPromptTemplateManager et EinsteinGPTPromptTemplateUser sont tous deux attribués.',
        'p0-ck-dwu': 'Le Default Workflow User est configuré et identifié.',
        'p0-ck-field-plan': 'Le champ personnalisé est prévu en Rich Text Area.',
      },
    },

    // ------------------------------------------------------- Phase 1
    'phase-1': {
      title: 'Préparer les données du compte',
      doneWhen:
        'Le champ texte enrichi existe et la présentation de page expose les données nécessaires au Record Snapshot.',
      intro:
        "Créez le champ qui stocke le briefing généré, puis assurez-vous que la présentation de compte vue par le Default Workflow User expose tout ce dont le prompt a besoin.",
      steps: {
        'p1-create-field': {
          title: 'Étape 1 — Créer le champ personnalisé sur Account',
          compactLabel: 'Créer le champ texte enrichi',
          summary:
            "Ajoutez un champ « Rich Text Area » sur Account pour stocker le HTML que le prompt génère.",
          instructions: [
            'Choisissez « Rich Text Area ».',
            'Saisissez l’étiquette : Account Meeting Briefing.',
            'Définissez la longueur et les lignes visibles.',
            'Cliquez sur « Next » à travers la sécurité au niveau du champ.',
            'Ajoutez le champ à la ou aux présentations de page concernées.',
            'Cliquez sur « Save ».',
          ],
          valuesToEnter: [
            { field: 'Étiquette (Label)' },
            {},
            {},
            { field: 'Longueur', value: '32768 (ou le maximum de votre choix)' },
            { field: 'Lignes visibles' },
            { field: 'Objectif', value: 'Stocke le HTML généré par le prompt' },
          ],
          copyBlocks: {
            'p1-field-api': "Nom d'API du champ",
          },
          whyItMatters:
            "Le prompt écrit du HTML propre ; seul un champ « Rich Text Area » l'affiche. Un « Long Text Area » montrerait les balises HTML brutes.",
          warnings: {
            'p1-field-w1': {
              title: 'Doit être « Rich Text Area »',
              body: "Si vous créez un « Long Text Area » par erreur, le champ affichera les balises HTML brutes. Recréez-le en « Rich Text Area ».",
            },
          },
        },
        'p1-prepare-layout': {
          title: 'Étape 2 — Préparer la présentation de page Account pour le Record Snapshot',
          compactLabel: 'Exposer les champs sur la présentation',
          summary:
            "Le Record Snapshot lit la présentation que voit le Default Workflow User. Ajoutez chaque champ et liste associée dont le prompt a besoin.",
          instructions: [
            'Ouvrez la présentation de page Account attribuée au profil du Default Workflow User.',
            'Ajoutez les champs et listes associées requis s’ils manquent.',
            'Enregistrez la présentation.',
          ],
          valuesToEnter: [
            { field: 'Champs requis' },
            { field: 'Listes associées requises' },
            {
              field: 'Présentation attribuée',
              value: 'La présentation attribuée au profil du Default Workflow User',
            },
          ],
          copyBlocks: {
            'p1-snapshot-token': 'Jeton Record Snapshot',
          },
          whyItMatters:
            "Le Record Snapshot utilise la présentation de page visible par le Default Workflow User. Si un champ ou une liste associée manque sur cette présentation, le prompt ne recevra pas cette donnée.",
          beginnerTip:
            "Idée clé : le Record Snapshot ne peut utiliser que les données visibles par le Default Workflow User sur la présentation Account concernée.",
        },
      },
      checklist: {
        'p1-ck-field':
          'Account_Meeting_Briefing__c existe en tant que « Rich Text Area ».',
        'p1-ck-layout-fields':
          'La présentation inclut Account Name, Account Id, Industry, Region, Customer Since, Description.',
        'p1-ck-layout-lists':
          'La présentation inclut les listes associées Opportunities, Tasks et Events.',
      },
    },

    // ------------------------------------------------------- Phase 2
    'phase-2': {
      title: 'Construire le prompt',
      doneWhen:
        'Le modèle de prompt « Field Generation » est créé, testé, enregistré et activé.',
      intro:
        "Créez un modèle de prompt « Field Generation » qui écrit la réponse du LLM directement dans votre nouveau champ, puis testez-le et activez-le.",
      steps: {
        'p2-create-template': {
          title: 'Étape 3 — Créer le modèle de prompt dans Prompt Builder',
          compactLabel: 'Créer le modèle de prompt',
          summary:
            "Créez un modèle « Field Generation » ciblant le champ Account_Meeting_Briefing__c, puis collez le texte du prompt.",
          instructions: [
            'Cliquez sur « New Prompt Template ».',
            'Sélectionnez « Field Generation ».',
            'Renseignez Template Name, API Name, Object et Target Field (voir les valeurs).',
            'Collez le texte du prompt dans le modèle.',
          ],
          valuesToEnter: [
            { field: 'Nom du modèle (Template Name)' },
            {},
            { field: 'Objet (Object)' },
            { field: 'Champ cible (Target Field)' },
          ],
          copyBlocks: {
            'p2-template-api': "Nom d'API du modèle",
            'p2-prompt-text': 'Account Summary Prompt (texte complet du prompt)',
          },
          whyItMatters:
            "« Field Generation » est conçu pour écrire la réponse du LLM directement dans un champ d'un enregistrement Salesforce.",
          beginnerTip:
            "Prompt Builder peut ne pas apparaître dans Quick Find. Utilisez plutôt la barre « Search Setup » en haut.",
          warnings: {
            'p2-prompt-critical': {
              title: 'Conservez la ligne « no code fences »',
              body: 'Conservez la ligne « Do not wrap the HTML in markdown, code fences, or quotation marks. » Elle aide à éviter un rendu Rich Text cassé.',
            },
          },
        },
        'p2-test-activate': {
          title: 'Tester et activer le modèle de prompt',
          compactLabel: 'Tester et activer le modèle',
          summary:
            'Prévisualisez sur un compte riche, confirmez un HTML propre, puis « Save » et « Activate ».',
          instructions: [
            'Cliquez sur « Preview ».',
            'Testez avec un compte qui a des Opportunities, Tasks et Events.',
            'Vérifiez que la réponse est du HTML propre, sans « code fences ».',
            'Cliquez sur « Save ».',
            'Cliquez sur « Activate ».',
          ],
          passCriteria:
            'La prévisualisation renvoie du HTML propre (sans « code fences ») et le modèle est activé.',
          whyItMatters:
            "Le modèle doit être activé avant d'apparaître comme action dans Flow Builder.",
          warnings: {
            'p2-activate-w1': {
              title: 'Activez avant de construire le flux',
              body: "Le modèle de prompt doit être activé avant d'apparaître comme action dans Flow Builder.",
            },
          },
        },
      },
      checklist: {
        'p2-ck-created':
          'Modèle « Field Generation » « Account Summary Prompt » créé.',
        'p2-ck-clean-html':
          'La prévisualisation a renvoyé du HTML propre, sans « code fences ».',
        'p2-ck-activated': 'Le modèle est enregistré et activé.',
      },
    },

    // ------------------------------------------------------- Phase 3
    'phase-3': {
      title: 'Construire le flux',
      doneWhen:
        "Le flux planifié exécute le prompt, vérifie la réponse, met à jour le compte et gère les erreurs.",
      intro:
        "Construisez un flux déclenché par planification qui identifie les comptes cibles, exécute l'action du prompt, vérifie la réponse, met à jour le champ et vous envoie un e-mail en cas d'échec.",
      steps: {
        'p3-create-flow': {
          title: 'Étape 4 — Créer le flux déclenché par planification',
          compactLabel: 'Créer le flux planifié',
          summary:
            "Créez un flux déclenché par planification, réglez-le pour s'exécuter chaque jour avant l'arrivée des utilisateurs, et filtrez sur un petit ensemble de comptes pour commencer.",
          instructions: [
            'Créez un nouveau flux déclenché par planification (« Schedule-Triggered Flow »).',
            'Configurez la planification de l’élément « Start » (voir les valeurs).',
            "Réglez l'objet sur Account et ajoutez un filtre restrictif.",
          ],
          valuesToEnter: [
            { field: 'Date de début (Start Date)', value: 'Demain ou une date future' },
            { field: 'Heure de début (Start Time)', value: '06:30, avant l’arrivée des utilisateurs' },
            { field: 'Fréquence (Frequency)' },
            { field: 'Objet (Object)' },
            { field: 'Exigences de condition (Condition Requirements)' },
            { field: 'Filtre d’exemple' },
          ],
          whyItMatters:
            "Une planification plus un filtre restrictif vous permettent de prouver l'automatisation sur quelques comptes avant qu'elle ne touche toute votre org.",
          beginnerTip:
            'Commencez avec un filtre restrictif tel que Owner ou Industry. Testez d’abord avec quelques comptes, puis élargissez.',
          warnings: {
            'p3-tz-tip': {
              title: 'Fuseau horaire',
              body: "L'heure planifiée utilise le fuseau horaire par défaut de l'org, et non le fuseau personnel de l'utilisateur. Vérifiez dans Setup > Company Information > Default Time Zone.",
            },
          },
        },
        'p3-prompt-action': {
          title: 'Étape 5 — Ajouter l’action Prompt Template',
          compactLabel: 'Ajouter l’action prompt + RelatedEntity',
          summary:
            "Ajoutez l'action du prompt, puis définissez son entrée RelatedEntity avec une valeur JSON saisie manuellement — pas via le sélecteur de ressources.",
          instructions: [
            'Cliquez sur + après « Start ».',
            'Sélectionnez « Action ».',
            'Recherchez « Account Summary Prompt ».',
            'Sélectionnez l’action de votre modèle.',
            'Pour RelatedEntity, passez le champ en mode texte/formule et saisissez la valeur JSON manuellement.',
          ],
          copyBlocks: {
            'p3-relatedentity': 'Entrée RelatedEntity (à saisir en mode texte/formule)',
            'p3-output-ref': 'Sortie automatique — Prompt Response',
            'p3-adv-var': 'Variable avancée facultative',
          },
          whyItMatters:
            "« Prompt Response » est le texte HTML généré. Le « Prompt Generation ID » est technique et généralement inutile.",
          warnings: {
            'p3-relatedentity-w1': {
              title: 'Ne sélectionnez pas $Record directement',
              body: 'Ne sélectionnez pas « Triggering Account » ni $Record directement depuis le sélecteur de ressources — cela provoque l’erreur de format RelatedEntity. Passez en mode texte/formule et saisissez {"Id":"{!$Record.Id}"} manuellement.',
            },
          },
        },
        'p3-decision': {
          title: 'Étape 6 — Ajouter un élément « Decision »',
          compactLabel: 'Ajouter la décision « réponse générée ? »',
          summary:
            "Vérifiez que le prompt a renvoyé une réponse avant de mettre à jour le compte, afin de ne jamais écraser le champ avec une valeur vide.",
          instructions: [
            'Cliquez sur + après l’action.',
            'Sélectionnez « Decision ».',
            'Configurez la décision comme indiqué dans les valeurs.',
          ],
          valuesToEnter: [
            { field: 'Étiquette de la décision (Decision Label)' },
            { field: 'Étiquette du résultat positif (Positive Outcome Label)' },
            { field: 'Ressource (Resource)' },
            { field: 'Opérateur (Operator)' },
            { field: 'Valeur (Value)' },
            { field: 'Étiquette du résultat par défaut (Default Outcome Label)' },
          ],
          copyBlocks: {
            'p3-decision-resource': 'Ressource de la décision',
            'p3-decision-value': 'Valeur de la décision',
          },
          whyItMatters:
            "Si « Prompt Response » n'est pas nul, continuez vers « Generated ». S'il n'y a pas de réponse, ne faites rien et laissez le flux passer au compte suivant — cela évite d'écraser le champ avec une valeur vide.",
        },
        'p3-update': {
          title: 'Étape 7 — Mettre à jour le compte sur le chemin « Generated »',
          compactLabel: 'Mettre à jour le champ du compte',
          summary:
            "Sur le chemin « Generated », écrivez la réponse du prompt dans le champ de briefing du compte courant.",
          instructions: [
            'Sur le chemin « Generated », cliquez sur +.',
            'Sélectionnez « Update Records ».',
            'Nommez-le : Update Account with Briefing.',
            'Pour « How to Find Records », sélectionnez « Use the account $Record global variable ».',
            'Définissez Account_Meeting_Briefing__c = {!Run_Account_Summary_Prompt.PromptResponse}.',
          ],
          valuesToEnter: [
            { field: 'Étiquette (Label)' },
            {
              field: 'Comment trouver les enregistrements (How to Find Records)',
              value: 'Utiliser la variable globale $Record du compte',
            },
            {},
          ],
          copyBlocks: {
            'p3-update-value': 'Valeur du champ',
          },
          whyItMatters:
            "Utiliser la variable globale $Record du compte met à jour le compte en cours de traitement par le flux planifié.",
        },
        'p3-fault': {
          title: 'Étape 8 — Ajouter la gestion des erreurs',
          compactLabel: 'Ajouter les chemins d’erreur + e-mail',
          summary:
            "Ajoutez un chemin d'erreur depuis l'action Prompt et l'élément « Update Records » qui envoie un e-mail à un admin en cas d'échec.",
          instructions: [
            'Cliquez sur l’élément (Prompt Template Action).',
            'Sélectionnez « Add Fault Path ».',
            'Sur le chemin d’erreur, ajoutez une action « Send Email ».',
            'Répétez pour l’élément « Update Records ».',
          ],
          valuesToEnter: [
            { field: 'À (To)', value: 'Adresse e-mail de l’admin Salesforce' },
            { field: 'Objet (Subject)' },
          ],
          copyBlocks: {
            'p3-fault-subject': 'Objet de l’e-mail',
            'p3-fault-body': 'Corps de l’e-mail',
          },
          whyItMatters:
            "Un chemin d'erreur sur l'action Prompt et sur l'élément « Update » signifie que vous êtes informé des échecs au lieu de ne produire silencieusement aucun briefing.",
          beginnerTip:
            "Une alerte e-mail suffit pour commencer. Plus tard, les admins peuvent créer un objet personnalisé tel que « Automation Error Log » pour un suivi structuré.",
          warnings: {
            'p3-fault-w1': {
              title: 'Les deux éléments ont besoin d’un chemin d’erreur',
              body: "Ajoutez un chemin d'erreur depuis À LA FOIS l'action Prompt Template et l'élément « Update Records ».",
            },
          },
        },
        'p3-save': {
          title: 'Étape 9 — Enregistrer le flux',
          compactLabel: 'Enregistrer (ne pas activer)',
          summary:
            "Enregistrez avec une étiquette et un nom d'API clairs — mais n'activez pas encore. Testez d'abord en Sandbox.",
          instructions: [
            'Cliquez sur « Save ».',
            'Saisissez le « Flow Label » et le « Flow API Name » (voir les valeurs).',
          ],
          valuesToEnter: [
            { field: 'Étiquette du flux (Flow Label)' },
            { field: "Nom d'API du flux (Flow API Name)" },
          ],
          copyBlocks: {
            'p3-flow-api': "Nom d'API du flux",
          },
          whyItMatters:
            "Enregistrer préserve votre travail ; retarder l'activation empêche un flux non testé de toucher les données de production.",
          warnings: {
            'p3-save-w1': {
              title: 'N’activez pas encore',
              body: "Enregistrez le flux, mais testez en Sandbox avant d'activer la planification quotidienne prête pour la production.",
            },
          },
        },
      },
      checklist: {
        'p3-ck-field':
          'Le champ personnalisé existe : Account_Meeting_Briefing__c est un « Rich Text Area » sur Account.',
        'p3-ck-snapshot':
          'Le Record Snapshot peut voir les données : la présentation du Default Workflow User inclut les champs et listes associées requis.',
        'p3-ck-active':
          'Le modèle de prompt est actif (testé, enregistré, activé).',
        'p3-ck-relatedentity':
          'RelatedEntity utilise {"Id":"{!$Record.Id}"} en mode texte/formule.',
        'p3-ck-decision':
          'La décision « Generated » vérifie que « Prompt Response » n’est pas nul avant la mise à jour.',
        'p3-ck-fault':
          "Les chemins d'erreur sur l'action Prompt et « Update Records » envoient un e-mail à l'admin.",
      },
    },

    // ------------------------------------------------------- Phase 4
    'phase-4': {
      title: 'Tester en Sandbox',
      doneWhen:
        "Le test en Sandbox utilise un filtre restrictif et une planification unique proche de maintenant.",
      intro:
        "Ne construisez jamais directement en Production. Effectuez un test unique et sûr dans une Sandbox et confirmez que le champ se remplit de HTML propre.",
      steps: {
        'p4-safe-test': {
          title: 'Étape 10 — Effectuer un test sûr',
          compactLabel: 'Lancer un test Sandbox unique',
          summary:
            "Choisissez un compte de test riche, réglez le flux pour s'exécuter « Once » proche de maintenant, activez, puis confirmez que le champ se remplit.",
          instructions: [
            'Créez ou choisissez un compte de test.',
            'Renseignez Industry, Region et Description.',
            'Ajoutez des Opportunities, Tasks et Events.',
            'Vérifiez que le compte correspond aux filtres « Start ».',
            'Réglez le flux sur « Once » à une heure proche de maintenant.',
            'Activez le flux.',
            'Attendez l’exécution et vérifiez dans Setup > Scheduled Jobs.',
            'Ouvrez le compte et confirmez que Account_Meeting_Briefing__c contient du HTML propre.',
          ],
          passCriteria:
            'Account_Meeting_Briefing__c contient du HTML propre après l’exécution.',
          whyItMatters:
            "Une exécution unique proche de maintenant donne un retour rapide sans attendre la planification quotidienne, et un filtre restrictif limite le rayon d'impact.",
          beginnerTip:
            "Le débogage des flux déclenchés par planification est limité. Pour un test au niveau enregistrement, créez un flux « Autolaunched » distinct avec la même logique mais sans élément « Start », appelez-le en tant que sous-flux (« Subflow »), et déboguez le sous-flux en choisissant l'enregistrement.",
          warnings: {
            'p4-critical': {
              title: 'Ne construisez jamais en Production',
              body: 'Testez toujours d’abord dans une Sandbox.',
            },
            'p4-norun': {
              title: 'Le flux ne s’exécute pas ?',
              body: "Vérifiez dans Setup > Scheduled Jobs. Confirmez que le flux a un « Next Scheduled Run ». Si « Started » est vide, il n'a pas encore atteint son heure planifiée. Confirmez le fuseau horaire de l'org si l'heure d'exécution semble incorrecte.",
            },
          },
        },
      },
      checklist: {
        'p4-ck-sandbox': 'Test effectué dans une Sandbox (pas en Production).',
        'p4-ck-test-account':
          'Le compte de test a Industry, Region, Description, ainsi que des Opportunities, Tasks, Events.',
        'p4-ck-once': 'Flux réglé sur « Once » à une heure proche de maintenant.',
        'p4-ck-clean-html':
          'Account_Meeting_Briefing__c contient du HTML propre après l’exécution.',
      },
    },

    // ------------------------------------------------------- Phase 5
    'phase-5': {
      title: 'Activer et surveiller',
      doneWhen:
        'Le flux est quotidien, actif et surveillé via Scheduled Jobs, Failed Flow Interviews et les e-mails admin.',
      intro:
        "Repassez la planification en « Daily », activez, et mettez en place votre routine de surveillance. Déployez progressivement.",
      steps: {
        'p5-activate': {
          title: 'Étape 11 — Activer une fois les tests réussis',
          compactLabel: 'Régler sur « Daily » et activer',
          summary:
            "Repassez la fréquence en « Daily » et activez le flux, puis surveillez-le.",
          instructions: ['Repassez la fréquence sur « Daily ».', 'Cliquez sur « Activate ».'],
          valuesToEnter: [
            { field: 'Tâches planifiées (Scheduled Jobs)' },
            { field: 'Interviews échouées (Failed Interviews)' },
            { field: 'E-mails d’erreur', value: 'Boîte de réception de l’admin' },
            { field: 'Résultat généré', value: 'Compte > champ Account Meeting Briefing' },
          ],
          whyItMatters:
            "« Daily » + actif est l'état de production ; surveiller les trois surfaces détecte les problèmes tôt.",
          beginnerTip:
            "Commencez avec un petit groupe de comptes. Élargissez progressivement après avoir confirmé les performances, la qualité de sortie et la gestion des erreurs.",
        },
      },
      checklist: {
        'p5-ck-daily': 'Fréquence repassée sur « Daily » et flux activé.',
        'p5-ck-jobs':
          'Un « Next Scheduled Run » confirmé dans Setup > Scheduled Jobs.',
        'p5-ck-monitoring':
          'Routine de surveillance en place : Scheduled Jobs, Failed Interviews et e-mails admin.',
      },
    },
  },

  validation: {
    'p-val-field': {
      label: 'Le champ existe',
      how: 'Account_Meeting_Briefing__c existe en tant que « Rich Text Area » sur Account.',
    },
    'p-val-prompt': {
      label: 'Prompt actif',
      how: 'Account Summary Prompt a été testé, enregistré et activé.',
    },
    'p-val-flow': {
      label: 'Flux enregistré',
      how: "Le flux « Daily Account Meeting Briefing » est enregistré avec la gestion des erreurs.",
    },
    'p-val-sandbox': {
      label: 'Test Sandbox réussi',
      how: 'Une exécution unique en Sandbox a rempli le champ de HTML propre.',
    },
    'p-val-monitoring': {
      label: 'Surveillance activée',
      how: 'Scheduled Jobs, Failed Flow Interviews et e-mails admin sont surveillés.',
    },
  },
};
