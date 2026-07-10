// ============================================================================
// French overlay for Journey 1 — Activate Agentforce Coworker.
//
// Sparse overlay keyed by the SAME ids as agentforceSteps.ts. Only
// human-readable prose is translated. Salesforce literals are intentionally
// omitted so they fall through to English: Setup navigation paths
// (navPath.segments / quickFind), Quick Find terms, permission-set /
// API names, and copy-block VALUES. Specific Salesforce UI labels, page names,
// button names and toggles are kept in English inside « » so the admin can
// still find them in their org.
// ============================================================================

import type { JourneyOverlay } from '../lib/localize';

export const agentforceOverlay: JourneyOverlay = {
  title: 'Activer Agentforce Coworker',
  tagline:
    "Activez Agentforce Coworker, activez l'expérience de recherche, attribuez l'accès et validez.",
  difficulty: 'Débutant / Admin',
  purpose:
    "Activez Agentforce Coworker (bêta) et mettez-le à disposition des utilisateurs afin qu'ils trouvent plus vite les informations dans Salesforce et les données connectées grâce à l'IA conversationnelle et à la recherche agentique.",
  includes: [
    'Einstein',
    'Agentforce',
    'Data 360',
    'Autorisations',
    'Accès utilisateur',
    'Validation',
  ],
  sections: {
    // ---------------------------------------------------------------- Overview
    overview: {
      title: "Vue d'ensemble",
      intro:
        "Dans cet exercice, vous activez Agentforce Coworker (bêta) et vous le mettez à disposition des utilisateurs. Agentforce Coworker aide les utilisateurs à trouver plus vite les informations dans Salesforce et les données connectées grâce à l'IA conversationnelle et à la recherche agentique. À la fin, les utilisateurs peuvent ouvrir Agentforce Coworker depuis Salesforce et l'utiliser pour effectuer des recherches dans les données disponibles.",
      steps: {
        'af-overview-whatyoulldo': {
          title: 'Ce que vous allez faire',
          compactLabel: 'Passer en revue le plan',
          summary:
            'Un aperçu rapide de tout le parcours pour savoir ce qui vous attend avant de commencer à cliquer.',
          instructions: [
            "Confirmez que les ensembles d'autorisations requis sont attribués à l'utilisateur admin.",
            "Ouvrez la page de configuration d'Agentforce Coworker.",
            'Passez en revue les sections de configuration.',
            'Passez en revue les sources de données Salesforce et Data 360.',
            "Activez l'expérience utilisateur final.",
            "Attribuez l'accès aux utilisateurs.",
            "Validez l'accès des utilisateurs.",
          ],
          whyItMatters:
            "Voir tout le chemin d'abord vous aide à rassembler licences et autorisations avant de tomber sur un blocage en pleine configuration.",
          beginnerTip:
            'Vous pouvez suivre ce parcours indépendamment du parcours Prompts IA personnalisés — faites l’un, l’autre ou les deux.',
        },
      },
      checklist: {
        'af-ck-read-overview':
          "J'ai lu la vue d'ensemble et je comprends l'objectif.",
      },
    },

    // ----------------------------------------------------------- Prerequisites
    prerequisites: {
      title: 'Prérequis',
      intro:
        "Activez les fonctionnalités de la plateforme dont dépend Agentforce Coworker, puis confirmez que votre utilisateur admin possède les bons ensembles d'autorisations. Effectuez ces étapes dans l'ordre.",
      warnings: {
        'af-prereq-warn': {
          title: "L'ordre compte",
          body: "Si les options Agentforce n'apparaissent pas plus tard, c'est presque toujours parce qu'Einstein n'a pas été activé en premier. Procédez de haut en bas.",
        },
      },
      steps: {
        'af-enable-einstein': {
          title: 'Activer Einstein',
          compactLabel: 'Activer Einstein',
          previewImg: 'https://i.postimg.cc/nV6M8FNr/Einstein-Setup.jpg',
          summary:
            'Einstein est la base de toutes les fonctionnalités d’IA générative. Il doit être activé avant que les options Agentforce n’apparaissent.',
          instructions: [
            'Ouvrez Salesforce Setup.',
            'Dans Quick Find de Setup, recherchez « Einstein Setup ».',
            'Ouvrez « Einstein Setup » sous « Einstein Generative AI ».',
            'Activez le bouton « Turn on Einstein ».',
          ],
          whyItMatters:
            "Einstein doit être activé avant que les options Agentforce ne soient disponibles où que ce soit dans Setup.",
          beginnerTip:
            "Après avoir activé Einstein, laissez un instant à la page et actualisez avant de chercher Agentforce — les nouveaux menus peuvent mettre quelques secondes à apparaître.",
          warnings: {
            'af-einstein-w1': {
              title: 'Options Agentforce manquantes ?',
              body: "Si les options Agentforce ne sont pas visibles à une étape ultérieure, revenez ici et confirmez d'abord qu'Einstein est activé.",
            },
          },
        },
        'af-enable-agentforce': {
          title: 'Activer Agentforce',
          compactLabel: 'Activer Agentforce',
          previewImg: 'https://i.postimg.cc/Qx1CjL3x/Enable-Agentforce.jpg',
          summary:
            'Activez Agentforce dans Agent Studio. Cela déverrouille les pages de configuration d’Agentforce Coworker.',
          instructions: [
            "Actualisez l'onglet du navigateur.",
            'Ouvrez Salesforce Setup.',
            'Recherchez « Agentforce ».',
            'Ouvrez « Agentforce Agents » sous « Agent Studio ».',
            'Activez le bouton Agentforce.',
          ],
          whyItMatters:
            "Agentforce Coworker fait partie de la famille Agentforce ; le bouton principal Agentforce doit être activé.",
          warnings: {
            'af-agentforce-w1': {
              title: 'Le bouton Agentforce n’est pas visible ?',
              body: "Retournez dans « Einstein Setup » et confirmez qu'Einstein est activé. Le bouton Agentforce n'apparaît qu'après l'activation d'Einstein.",
            },
          },
        },
        'af-enable-data360': {
          title: 'Activer Data 360 / Data Cloud (si nécessaire)',
          compactLabel: 'Activer Data 360 si nécessaire',
          previewImg: 'https://i.postimg.cc/R0Vw3CSK/Data-Cloud-Setup.jpg',
          summary:
            'Data 360 (Data Cloud) peut être requis pour des sources de données connectées ou externes. Activez-le si votre org ne l’a pas déjà fait.',
          instructions: [
            'Recherchez « Data Cloud Setup ».',
            'Ouvrez « Data Cloud Setup Home ».',
            "Si les détails de l'org ne sont pas visibles, cliquez sur « Get Started » pour activer Data 360.",
            'Attendez la fin de la configuration.',
          ],
          whyItMatters:
            "Data 360 / Data Cloud peut être nécessaire pour les sources de données connectées ou externes qu'Agentforce Coworker peut interroger.",
          beginnerTip:
            "Si votre org n'a besoin d'interroger que les données Salesforce principales pour commencer, vous pouvez continuer et revenir à Data 360 plus tard.",
          warnings: {
            'af-data360-w1': {
              title: 'Le provisionnement prend du temps',
              body: 'La configuration peut prendre quelques minutes. Certains boutons peuvent être désactivés jusqu’à la fin du provisionnement — c’est normal.',
            },
          },
        },
        'af-confirm-permsets': {
          title: "Confirmer les ensembles d'autorisations admin",
          compactLabel: "Attribuer les ensembles d'autorisations admin",
          previewImg: 'https://i.postimg.cc/13494Lx6/Permission-Set-Coworker.jpg',
          summary:
            "Assurez-vous que votre propre utilisateur admin possède les deux ensembles d'autorisations Agentforce Coworker, sinon l'activation peut être bloquée.",
          instructions: [
            'Depuis Setup, recherchez « user ».',
            'Sélectionnez « Users ».',
            "Ouvrez l'enregistrement de l'utilisateur admin.",
            'Allez dans « Permission Set Assignments ».',
            'Cliquez sur « Edit Assignments ».',
            "Confirmez que ces ensembles d'autorisations sont activés : Agentforce Coworker Admin et Agentforce Coworker User.",
            'Cliquez sur « Save ».',
          ],
          valuesToEnter: [
            { field: "Ensemble d'autorisations" },
            { field: "Ensemble d'autorisations" },
          ],
          copyBlocks: {
            'af-permset-admin': "Ensemble d'autorisations (Admin)",
            'af-permset-user': "Ensemble d'autorisations (Utilisateur)",
          },
          whyItMatters:
            "Sans ces ensembles d'autorisations, la configuration d'Agentforce Coworker peut être indisponible et l'activation peut être bloquée.",
          warnings: {
            'af-permset-w1': {
              title: "L'attribution bloque l'activation",
              body: "Si ces ensembles d'autorisations ne sont pas attribués, la configuration d'Agentforce Coworker peut être indisponible ou l'activation bloquée.",
            },
            'af-permset-w2': {
              title: "Ensembles d'autorisations non visibles ?",
              body: "Recherchez « Ask Agentforce » — les orgs plus anciennes peuvent utiliser l'ancienne dénomination des ensembles d'autorisations.",
            },
          },
        },
      },
      checklist: {
        'af-ck-einstein': 'Einstein est activé.',
        'af-ck-agentforce': 'Agentforce est activé.',
        'af-ck-data360':
          'Data 360 / Data Cloud est activé ou confirmé comme non nécessaire.',
        'af-ck-permsets':
          "L'utilisateur admin possède les deux ensembles d'autorisations Agentforce Coworker Admin et User.",
      },
    },

    // -------------------------------------------------- Turn On Agentforce Coworker
    'turn-on': {
      title: 'Activer Agentforce Coworker',
      intro:
        "Ouvrez la page de configuration d'Agentforce Coworker — le centre de contrôle de l'activation, des données, de l'expérience utilisateur final et de l'accès — puis suivez les huit étapes.",
      warnings: {
        'af-turnon-note': {
          title: 'Principalement automatisé',
          body: "La configuration d'Agentforce Coworker est en grande partie automatisée. Certaines étapes peuvent prendre quelques minutes.",
        },
      },
      steps: {
        'af-t-step1': {
          title: "Étape 1 — Ouvrir la configuration d'Agentforce Coworker",
          compactLabel: 'Ouvrir la config Coworker',
          summary:
            "Trouvez la zone Agentforce Coworker dans Setup et ouvrez la page de démarrage.",
          instructions: [
            'Depuis Setup, dans Quick Find, saisissez « coworker ».',
            'Sous « Agentforce Coworker », sélectionnez « Get Started with Agentforce Coworker ».',
          ],
          whyItMatters:
            "C'est le point de lancement de tout le processus d'activation.",
          previewImg: 'https://i.postimg.cc/g0NQR03K/coworker-step1.jpg',
        },
        'af-t-step2': {
          title: "Étape 2 — Passer en revue la page de configuration d'Agentforce Coworker",
          compactLabel: 'Revoir la page de config',
          summary:
            "Prenez vos repères. Cette page est le centre de contrôle de l'activation, des données, de l'expérience utilisateur final et de l'accès.",
          instructions: [
            "Sur la page de configuration d'Agentforce Coworker, passez en revue toutes les sections de configuration.",
            'Confirmez que « Turn on Agentforce Coworker » est visible.',
          ],
          whyItMatters:
            "Cette page est le centre de contrôle de l'activation, des données, de l'expérience utilisateur final et de l'accès. Connaître sa disposition accélère les étapes suivantes.",
          previewImg: 'https://i.postimg.cc/QN0zyCPN/coworker-turnon.jpg',
        },
        'af-t-step3': {
          title: 'Étape 3 — Passer en revue les options « Manage Data »',
          compactLabel: 'Revoir « Manage Data »',
          summary:
            "La section « Manage Data » contrôle quelles sources de données Agentforce Coworker peut interroger.",
          instructions: [
            'Faites défiler jusqu’à la section « Manage Data ».',
            'Passez en revue les sources de données disponibles.',
          ],
          whyItMatters:
            "Cette section contrôle quelles sources de données Agentforce Coworker peut interroger, afin que les utilisateurs n'obtiennent des résultats que des sources que vous autorisez.",
          warnings: {
            'af-t3-note': {
              title: "L'automatisation prend du temps",
              body: "La configuration d'Agentforce Coworker est en grande partie automatisée. Certaines étapes peuvent prendre quelques minutes.",
            },
          },
          previewImg: 'https://i.postimg.cc/bN4nTXxy/coworker-managedata.jpg',
        },
        'af-t-step4': {
          title: 'Étape 4 — Confirmer les sources de données disponibles',
          compactLabel: 'Confirmer la source Salesforce « Ready »',
          summary:
            'Vérifiez que la source de données Salesforce principale est provisionnée et prête à être interrogée.',
          instructions: [
            'Dans « Add Existing Data », passez en revue les sources.',
            'Confirmez que la source de données Salesforce affiche « Ready ».',
          ],
          passCriteria: 'Le statut de la source de données Salesforce est « Ready ».',
          whyItMatters:
            "Si la source Salesforce n'est pas « Ready », les recherches ne renverront rien, même une fois tout le reste activé.",
        },
        'af-t-step5': {
          title: 'Étape 5 — Passer en revue les options de recherche avancées',
          compactLabel: 'Revoir les options de recherche avancées',
          summary:
            "Deux paramètres facultatifs contrôlent l'affichage des recherches récentes et l'organisation des résultats.",
          instructions: [
            'Dans « Manage Data », passez en revue « Advanced Search Options ».',
            'Confirmez que les deux options sont visibles.',
          ],
          valuesToEnter: [
            {
              value:
                'Affiche les recherches récentes des utilisateurs dans la barre de recherche.',
            },
            {
              value:
                "Ouvre « Search Manager » pour définir les champs et organiser l'affichage des résultats.",
            },
          ],
          whyItMatters:
            "Ces options améliorent l'expérience de recherche au quotidien mais ne sont pas requises pour l'activation.",
        },
        'af-t-step6': {
          title: "Étape 6 — Activer l'expérience utilisateur final",
          compactLabel: 'Activer « Global Search Bar (Beta) »',
          summary:
            "Activez « Global Search Bar (Beta) » pour que les utilisateurs puissent lancer une recherche agentique depuis la barre de recherche globale.",
          instructions: [
            'Faites défiler jusqu’à « Turn on End User Experience ».',
            'Repérez « Global Search Bar (Beta) ».',
            'Cliquez sur « Manage ».',
          ],
          whyItMatters:
            "L'expérience « Global Search Bar » permet aux utilisateurs de lancer une recherche agentique dans Salesforce et les données connectées directement depuis la barre de recherche globale.",
          warnings: {
            'af-t6-w1': {
              title: 'Acceptez les conditions de la bêta',
              body: "Vous devez cliquer sur « Manage » et accepter les conditions de la bêta ici. Sauter cette étape est la raison la plus fréquente pour laquelle le bouton Coworker n'apparaît jamais pour les utilisateurs.",
            },
          },
          previewImg: 'https://i.postimg.cc/6Bcd4PSz/coworker-turnonuser.jpg',
        },
        'af-t-step7': {
          title: "Étape 7 — Donner l'accès aux utilisateurs",
          compactLabel: 'Attribuer les utilisateurs',
          summary:
            'Attribuez les utilisateurs qui doivent pouvoir utiliser Agentforce Coworker.',
          instructions: [
            'Faites défiler jusqu’à « Manage Users ».',
            'Repérez « Manage Access to Agentforce Coworker ».',
            'Cliquez sur « Manage ».',
            "Dans la fenêtre « Manage Agentforce Coworker User Access », sélectionnez l'utilisateur.",
            'Cliquez sur « Assign ».',
          ],
          whyItMatters:
            "Seuls les utilisateurs attribués peuvent voir et utiliser Agentforce Coworker, même une fois l'expérience activée.",
          previewImg: 'https://i.postimg.cc/RZNBv8yW/coworker-manageuser.jpg',
        },
        'af-t-step8': {
          title: "Étape 8 — Confirmer l'attribution",
          compactLabel: "Confirmer le succès de l'attribution",
          summary:
            "Vérifiez que l'utilisateur attribué affiche « Success » dans le récapitulatif d'attribution.",
          instructions: [
            'Passez en revue le récapitulatif d’attribution (« Assignment Summary »).',
            "Confirmez que l'utilisateur sélectionné affiche « Success ».",
            'Cliquez sur « Done ».',
          ],
          passCriteria: "L'attribution de l'utilisateur affiche « Success ».",
          whyItMatters:
            "Un statut « Success » confirme que l'octroi d'accès est terminé et que l'utilisateur est prêt pour la validation.",
        },
      },
      checklist: {
        'af-ck-setup-open':
          "Ouverture de la page de configuration d'Agentforce Coworker.",
        'af-ck-source-ready':
          'La source de données Salesforce affiche « Ready ».',
        'af-ck-eux-on':
          '« Global Search Bar (Beta) » activée et conditions de la bêta acceptées.',
        'af-ck-user-assigned':
          "Au moins un utilisateur attribué avec le statut « Success ».",
      },
    },

    // ------------------------------------------------------------- Validation
    validation: {
      title: 'Validation',
      intro:
        "Confirmez que l'expérience fonctionne réellement pour un utilisateur réel avant de l'annoncer.",
      steps: {
        'af-validate': {
          title: "Valider l'accès des utilisateurs",
          compactLabel: 'Lancer une recherche de validation',
          summary:
            "Connectez-vous en tant qu'utilisateur attribué (ou usurpez son identité) et lancez une vraie recherche pour confirmer que des résultats apparaissent.",
          instructions: [
            "Connectez-vous en tant que l'utilisateur ayant reçu l'accès, ou usurpez son identité.",
            "Confirmez que l'expérience Agentforce Coworker est disponible.",
            'Lancez une recherche de test depuis la barre de recherche globale.',
            "Confirmez que les résultats s'affichent comme prévu.",
          ],
          passCriteria:
            "L'utilisateur attribué voit Agentforce Coworker et une recherche de test renvoie des résultats.",
          whyItMatters:
            "Valider en tant qu'utilisateur final détecte les problèmes de profil, de console ou d'autorisation que la vue admin masque.",
          beginnerTip:
            "Confirmez que l'utilisateur est dans une application « Sales Console » ou « Service Console » — le bouton Coworker peut ne pas apparaître dans une application Lightning standard.",
        },
      },
      checklist: {
        'af-ck-val-available':
          "Agentforce Coworker est disponible pour l'utilisateur attribué.",
        'af-ck-val-search': 'Une recherche de test a renvoyé des résultats.',
      },
    },

    // ----------------------------------------------------- Optional next steps
    'next-steps': {
      title: 'Étapes suivantes facultatives',
      intro:
        "Une fois les bases opérationnelles, vous pouvez étendre ce qu'Agentforce Coworker peut interroger et l'apparence des résultats.",
      steps: {
        'af-next-slack': {
          title: 'Rendre Slack interrogeable dans Agentforce Coworker',
          compactLabel: 'Ajouter Slack',
          summary: 'Permettre aux utilisateurs de rechercher le contenu Slack connecté.',
          whyItMatters:
            'Intègre les conversations et décisions de Slack dans la même expérience de recherche.',
        },
        'af-next-data360': {
          title: 'Rendre Data 360 interrogeable dans Agentforce Coworker',
          compactLabel: 'Ajouter Data 360',
          summary: 'Permettre aux utilisateurs de rechercher le contenu Data 360 connecté.',
          whyItMatters:
            'Étend la recherche aux données unifiées et externes gérées dans Data 360.',
        },
        'af-next-recent': {
          title: 'Activer les recherches récentes',
          compactLabel: 'Recherches récentes',
          summary:
            'Affiche les recherches récentes des utilisateurs dans la barre de recherche.',
          whyItMatters: 'Accélère les recherches répétées pour les utilisateurs occupés.',
        },
        'af-next-customize': {
          title: 'Personnaliser les résultats et la disposition',
          compactLabel: 'Personnaliser les résultats',
          summary:
            "Contrôlez quels champs apparaissent dans la recherche et comment les résultats sont organisés.",
          whyItMatters:
            'Adapte les résultats aux champs qui comptent vraiment pour vos utilisateurs.',
        },
      },
    },
  },

  validation: {
    'af-val-access': {
      label: "L'utilisateur a accès",
      how: "L'utilisateur attribué peut ouvrir Agentforce Coworker dans Salesforce.",
    },
    'af-val-searchbar': {
      label: 'Barre de recherche disponible',
      how: "L'expérience « Global Search Bar (Beta) » est visible pour l'utilisateur.",
    },
    'af-val-testsearch': {
      label: 'Recherche de test effectuée',
      how: 'Une recherche a été lancée depuis la barre de recherche globale.',
    },
    'af-val-results': {
      label: 'Résultats affichés',
      how: "Les résultats de recherche se sont affichés comme prévu.",
    },
  },
};
