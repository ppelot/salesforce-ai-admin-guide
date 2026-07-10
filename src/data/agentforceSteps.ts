// ============================================================================
// Journey 1 — Activate Agentforce Coworker.
// Content is transcribed from the "Automated AI Use case" Admin Guide PDF.
// ============================================================================

import type { Journey } from '../lib/types';

export const agentforceJourney: Journey = {
  id: 'agentforce',
  title: 'Activate Agentforce Coworker',
  tagline:
    'Turn on Agentforce Coworker, enable the search experience, assign access, and validate.',
  icon: 'bot',
  difficulty: 'Beginner / Admin',
  purpose:
    'Turn on Agentforce Coworker (Beta) and make it available to users so they can find information faster across Salesforce and connected data using conversational AI and agentic search.',
  includes: [
    'Einstein',
    'Agentforce',
    'Data 360',
    'Permissions',
    'User access',
    'Validation',
  ],
  sections: [
    // ---------------------------------------------------------------- Overview
    {
      id: 'overview',
      title: 'Overview',
      intro:
        'In this exercise you turn on Agentforce Coworker (Beta) and make it available to users. Agentforce Coworker helps users find information faster across Salesforce and connected data using conversational AI and agentic search. By the end, users can open Agentforce Coworker from Salesforce and use it to search across available data.',
      steps: [
        {
          id: 'af-overview-whatyoulldo',
          order: 1,
          gating: 'optional',
          title: "What you'll do",
          compactLabel: 'Review the plan',
          summary:
            'A quick map of the whole journey so you know what is coming before you start clicking.',
          instructions: [
            'Confirm required permission sets are assigned to the admin user.',
            'Open the Agentforce Coworker setup page.',
            'Review setup sections.',
            'Review Salesforce and Data 360 data sources.',
            'Turn on the end-user experience.',
            'Assign access to users.',
            'Validate user access.',
          ],
          whyItMatters:
            'Seeing the full path first helps you gather licenses and permissions before you hit a blocker mid-setup.',
          beginnerTip:
            'You can complete this journey independently of the Personalized AI Prompts journey — do either or both.',
        },
      ],
      checklist: [
        {
          id: 'af-ck-read-overview',
          label: 'I read the overview and understand the goal.',
          blocking: false,
        },
      ],
    },

    // ----------------------------------------------------------- Prerequisites
    {
      id: 'prerequisites',
      title: 'Prerequisites',
      intro:
        'Enable the platform features Agentforce Coworker depends on, then confirm your admin user has the right permission sets. Complete these in order.',
      warnings: [
        {
          id: 'af-prereq-warn',
          level: 'warning',
          title: 'Order matters',
          body: 'If Agentforce options are not visible later, it is almost always because Einstein was not enabled first. Work top to bottom.',
        },
      ],
      steps: [
        {
          id: 'af-enable-einstein',
          order: 1,
          gating: 'required',
          title: 'Enable Einstein',
          compactLabel: 'Turn on Einstein',
          previewImg: 'https://i.postimg.cc/nV6M8FNr/Einstein-Setup.jpg',
          summary:
            'Einstein is the foundation for all generative-AI features. It must be on before Agentforce options appear.',
          navPath: {
            segments: [
              'Setup',
              'Quick Find',
              'Einstein Setup',
              'Einstein Generative AI',
            ],
            quickFind: 'Einstein Setup',
          },
          instructions: [
            'Open Salesforce Setup.',
            'In Setup Quick Find, search "Einstein Setup".',
            'Open Einstein Setup under Einstein Generative AI.',
            'Turn on the "Turn on Einstein" toggle.',
          ],
          whyItMatters:
            'Einstein must be enabled before Agentforce options are available anywhere in Setup.',
          beginnerTip:
            'After toggling Einstein on, give the page a moment and refresh before hunting for Agentforce — new menus can take a few seconds to appear.',
          warnings: [
            {
              id: 'af-einstein-w1',
              level: 'warning',
              title: 'Agentforce options missing?',
              body: 'If Agentforce options are not visible in a later step, come back and confirm Einstein is enabled first.',
            },
          ],
        },
        {
          id: 'af-enable-agentforce',
          order: 2,
          gating: 'required',
          title: 'Enable Agentforce',
          compactLabel: 'Turn on Agentforce',
          previewImg: 'https://i.postimg.cc/Qx1CjL3x/Enable-Agentforce.jpg',
          summary:
            'Turn on Agentforce in Agent Studio. This unlocks the Agentforce Coworker setup pages.',
          navPath: {
            segments: [
              'Setup',
              'Quick Find',
              'Agentforce',
              'Agent Studio',
              'Agentforce Agents',
            ],
            quickFind: 'Agentforce',
          },
          instructions: [
            'Refresh the browser tab.',
            'Open Salesforce Setup.',
            'Search "Agentforce".',
            'Open Agentforce Agents under Agent Studio.',
            'Turn on the Agentforce toggle.',
          ],
          whyItMatters:
            'Agentforce Coworker is part of the Agentforce family; the master Agentforce toggle must be on.',
          warnings: [
            {
              id: 'af-agentforce-w1',
              level: 'blocker',
              title: 'Agentforce toggle not visible?',
              body: 'Return to Einstein Setup and confirm Einstein is on. The Agentforce toggle only appears after Einstein is enabled.',
            },
          ],
        },
        {
          id: 'af-enable-data360',
          order: 3,
          gating: 'recommended',
          title: 'Enable Data 360 / Data Cloud (if needed)',
          compactLabel: 'Enable Data 360 if needed',
          previewImg: 'https://i.postimg.cc/R0Vw3CSK/Data-Cloud-Setup.jpg',
          summary:
            'Data 360 (Data Cloud) may be required for connected or external data sources. Enable it if your org has not already.',
          navPath: {
            segments: [
              'Setup',
              'Quick Find',
              'Data Cloud Setup',
              'Data Cloud Setup Home',
            ],
            quickFind: 'Data Cloud Setup',
          },
          instructions: [
            'Search "Data Cloud Setup".',
            'Open Data Cloud Setup Home.',
            'If org details are not visible, click "Get Started" to enable Data 360.',
            'Wait for setup to complete.',
          ],
          whyItMatters:
            'Data 360 / Data Cloud may be needed for connected or external data sources that Agentforce Coworker can search.',
          beginnerTip:
            'If your org only needs to search core Salesforce data to start, you can proceed and come back to Data 360 later.',
          warnings: [
            {
              id: 'af-data360-w1',
              level: 'warning',
              title: 'Provisioning takes time',
              body: 'Setup can take a few minutes. Some buttons may be disabled until provisioning finishes — this is expected.',
            },
          ],
        },
        {
          id: 'af-confirm-permsets',
          order: 4,
          gating: 'required',
          title: 'Confirm admin permission sets',
          compactLabel: 'Assign admin permission sets',
          previewImg: 'https://i.postimg.cc/13494Lx6/Permission-Set-Coworker.jpg',
          summary:
            'Make sure your own admin user has the two Agentforce Coworker permission sets, or activation may be blocked.',
          navPath: {
            segments: [
              'Setup',
              'Users',
              'Users',
              'Permission Set Assignments',
              'Edit Assignments',
            ],
            quickFind: 'Users',
          },
          instructions: [
            'From Setup, search "user".',
            'Select Users.',
            'Open the admin user record.',
            'Go to Permission Set Assignments.',
            'Click Edit Assignments.',
            'Confirm these permission sets are enabled: Agentforce Coworker Admin and Agentforce Coworker User.',
            'Click Save.',
          ],
          valuesToEnter: [
            {
              field: 'Permission set',
              value: 'Agentforce Coworker Admin',
              copyable: true,
            },
            {
              field: 'Permission set',
              value: 'Agentforce Coworker User',
              copyable: true,
            },
          ],
          copyBlocks: [
            {
              id: 'af-permset-admin',
              label: 'Permission set (Admin)',
              value: 'Agentforce Coworker Admin',
              kind: 'apiName',
            },
            {
              id: 'af-permset-user',
              label: 'Permission set (User)',
              value: 'Agentforce Coworker User',
              kind: 'apiName',
            },
          ],
          whyItMatters:
            'Without these permission sets, the Agentforce Coworker setup may not be available and activation can be blocked.',
          warnings: [
            {
              id: 'af-permset-w1',
              level: 'warning',
              title: 'Assignment blocks activation',
              body: 'If these permission sets are not assigned, Agentforce Coworker setup may not be available or activation may be blocked.',
            },
            {
              id: 'af-permset-w2',
              level: 'tip',
              title: 'Permission sets not visible?',
              body: 'Search for "Ask Agentforce" — older orgs may use the older permission-set naming.',
            },
          ],
        },
      ],
      checklist: [
        {
          id: 'af-ck-einstein',
          label: 'Einstein is turned on.',
          blocking: true,
        },
        {
          id: 'af-ck-agentforce',
          label: 'Agentforce is turned on.',
          blocking: true,
        },
        {
          id: 'af-ck-data360',
          label: 'Data 360 / Data Cloud is enabled or confirmed not needed.',
          blocking: false,
        },
        {
          id: 'af-ck-permsets',
          label:
            'Admin user has both Agentforce Coworker Admin and User permission sets.',
          blocking: true,
        },
      ],
    },

    // -------------------------------------------------- Turn On Agentforce Coworker
    {
      id: 'turn-on',
      title: 'Turn On Agentforce Coworker',
      intro:
        'Open the Agentforce Coworker setup page — the control center for activation, data, the end-user experience, and access — then work through the eight steps.',
      warnings: [
        {
          id: 'af-turnon-note',
          level: 'info',
          title: 'Mostly automated',
          body: 'Agentforce Coworker setup is mostly automated. Some steps can take a few minutes to finish.',
        },
      ],
      steps: [
        {
          id: 'af-t-step1',
          order: 1,
          gating: 'required',
          title: 'Step 1 — Open Agentforce Coworker setup',
          compactLabel: 'Open Coworker setup',
          summary:
            'Find the Agentforce Coworker area in Setup and open the getting-started page.',
          navPath: {
            segments: [
              'Setup',
              'Quick Find',
              'coworker',
              'Agentforce Coworker',
              'Get Started with Agentforce Coworker',
            ],
            quickFind: 'coworker',
          },
          instructions: [
            'From Setup, in Quick Find, enter "coworker".',
            'Under Agentforce Coworker, select "Get Started with Agentforce Coworker".',
          ],
          whyItMatters:
            'This is the launch point for the entire activation flow.',
          previewImg: 'https://i.postimg.cc/g0NQR03K/coworker-step1.jpg',
        },
        {
          id: 'af-t-step2',
          order: 2,
          gating: 'required',
          title: 'Step 2 — Review the Agentforce Coworker setup page',
          compactLabel: 'Review setup page',
          summary:
            'Get oriented. This page is the control center for activation, data, end-user experience, and access.',
          instructions: [
            'On the Agentforce Coworker setup page, review all setup sections.',
            'Confirm that "Turn on Agentforce Coworker" is visible.',
          ],
          whyItMatters:
            'This page is the control center for activation, data, the end-user experience, and access. Knowing its layout makes the next steps faster.',
          previewImg: 'https://i.postimg.cc/QN0zyCPN/coworker-turnon.jpg',
        },
        {
          id: 'af-t-step3',
          order: 3,
          gating: 'required',
          title: 'Step 3 — Review Manage Data options',
          compactLabel: 'Review Manage Data',
          summary:
            'The Manage Data section controls which data sources Agentforce Coworker can search.',
          instructions: [
            'Scroll to the "Manage Data" section.',
            'Review the available data sources.',
          ],
          whyItMatters:
            'This section controls which data sources Agentforce Coworker can search, so users only get results from sources you allow.',
          warnings: [
            {
              id: 'af-t3-note',
              level: 'info',
              title: 'Automation takes time',
              body: 'Agentforce Coworker setup is mostly automated. Some steps can take a few minutes.',
            },
          ],
          previewImg: 'https://i.postimg.cc/bN4nTXxy/coworker-managedata.jpg',
        },
        {
          id: 'af-t-step4',
          order: 4,
          gating: 'required',
          title: 'Step 4 — Confirm available data sources',
          compactLabel: 'Confirm Salesforce source Ready',
          summary:
            'Verify the core Salesforce data source is provisioned and ready to search.',
          instructions: [
            'In "Add Existing Data", review the sources.',
            'Confirm the Salesforce data source shows "Ready".',
          ],
          passCriteria: 'Salesforce data source status is Ready.',
          whyItMatters:
            'If the Salesforce source is not Ready, searches will return nothing even after everything else is on.',
        },
        {
          id: 'af-t-step5',
          order: 5,
          gating: 'recommended',
          title: 'Step 5 — Review advanced search options',
          compactLabel: 'Review advanced search options',
          summary:
            'Two optional settings control recent-search display and how results are arranged.',
          instructions: [
            'In Manage Data, review Advanced Search Options.',
            'Confirm both options are visible.',
          ],
          valuesToEnter: [
            {
              field: 'Turn On Recent Searches',
              value: "Displays users' recent searches in the search bar.",
            },
            {
              field: 'Manage Search Settings',
              value:
                'Opens Search Manager to define fields and arrange how results appear.',
            },
          ],
          whyItMatters:
            'These options improve the day-to-day search experience but are not required to activate.',
        },
        {
          id: 'af-t-step6',
          order: 6,
          gating: 'required',
          title: 'Step 6 — Turn on the end-user experience',
          compactLabel: 'Turn on Global Search Bar (Beta)',
          summary:
            'Enable the Global Search Bar (Beta) so users can run agentic search from the global search bar.',
          navPath: {
            segments: [
              'Agentforce Coworker setup page',
              'Turn on End User Experience',
              'Global Search Bar (Beta)',
              'Manage',
            ],
          },
          instructions: [
            'Scroll to "Turn on End User Experience".',
            'Locate "Global Search Bar (Beta)".',
            'Click Manage.',
          ],
          whyItMatters:
            'The Global Search Bar experience lets users run agentic search across Salesforce and connected data directly from the global search bar.',
          warnings: [
            {
              id: 'af-t6-w1',
              level: 'blocker',
              title: 'Accept the Beta terms',
              body: 'You must click Manage and accept the Beta terms here. Skipping this is the most common reason the Coworker button never appears for users.',
            },
          ],
          previewImg: 'https://i.postimg.cc/6Bcd4PSz/coworker-turnonuser.jpg',
        },
        {
          id: 'af-t-step7',
          order: 7,
          gating: 'required',
          title: 'Step 7 — Give users access',
          compactLabel: 'Assign users',
          summary:
            'Assign the users who should be able to use Agentforce Coworker.',
          navPath: {
            segments: [
              'Agentforce Coworker setup page',
              'Manage Users',
              'Manage Access to Agentforce Coworker',
              'Manage',
            ],
          },
          instructions: [
            'Scroll to Manage Users.',
            'Locate "Manage Access to Agentforce Coworker".',
            'Click Manage.',
            'In the Manage Agentforce Coworker User Access window, select the user.',
            'Click Assign.',
          ],
          whyItMatters:
            'Only assigned users can see and use Agentforce Coworker, even after the experience is turned on.',
          previewImg: 'https://i.postimg.cc/RZNBv8yW/coworker-manageuser.jpg',
        },
        {
          id: 'af-t-step8',
          order: 8,
          gating: 'required',
          title: 'Step 8 — Confirm assignment',
          compactLabel: 'Confirm assignment success',
          summary:
            'Verify the user you assigned shows Success in the Assignment Summary.',
          instructions: [
            'Review the Assignment Summary.',
            'Confirm the selected user shows Success.',
            'Click Done.',
          ],
          passCriteria: 'User assignment shows Success.',
          whyItMatters:
            'A Success status confirms the access grant completed and the user is ready to validate.',
        },
      ],
      checklist: [
        {
          id: 'af-ck-setup-open',
          label: 'Opened the Agentforce Coworker setup page.',
          blocking: true,
        },
        {
          id: 'af-ck-source-ready',
          label: 'Salesforce data source shows Ready.',
          blocking: true,
        },
        {
          id: 'af-ck-eux-on',
          label: 'Global Search Bar (Beta) turned on and Beta terms accepted.',
          blocking: true,
        },
        {
          id: 'af-ck-user-assigned',
          label: 'At least one user assigned with Success status.',
          blocking: true,
        },
      ],
    },

    // ------------------------------------------------------------- Validation
    {
      id: 'validation',
      title: 'Validation',
      intro:
        'Confirm the experience actually works for a real user before you announce it.',
      steps: [
        {
          id: 'af-validate',
          order: 1,
          gating: 'required',
          title: 'Validate user access',
          compactLabel: 'Run a validation search',
          summary:
            'Log in as (or impersonate) an assigned user and run a real search to confirm results appear.',
          instructions: [
            'Log in as, or impersonate, the user who was granted access.',
            'Confirm the Agentforce Coworker experience is available.',
            'Run a test search from the global search bar.',
            'Confirm results display as expected.',
          ],
          passCriteria:
            'The assigned user sees Agentforce Coworker and a test search returns results.',
          whyItMatters:
            'Validating as the end user catches profile, console, or permission issues that the admin view hides.',
          beginnerTip:
            'Confirm the user is in a Sales Console or Service Console app — the Coworker button may not show in a standard Lightning app.',
        },
      ],
      checklist: [
        {
          id: 'af-ck-val-available',
          label: 'Agentforce Coworker is available to the assigned user.',
          blocking: true,
        },
        {
          id: 'af-ck-val-search',
          label: 'A test search returned results.',
          blocking: true,
        },
      ],
    },

    // ----------------------------------------------------- Optional next steps
    {
      id: 'next-steps',
      title: 'Optional next steps',
      intro:
        'Once the basics work, you can expand what Agentforce Coworker can search and how results look.',
      steps: [
        {
          id: 'af-next-slack',
          order: 1,
          gating: 'optional',
          title: 'Make Slack searchable in Agentforce Coworker',
          compactLabel: 'Add Slack',
          summary: 'Allow users to search connected Slack content.',
          whyItMatters:
            'Brings conversations and decisions from Slack into the same search experience.',
        },
        {
          id: 'af-next-data360',
          order: 2,
          gating: 'optional',
          title: 'Make Data 360 searchable in Agentforce Coworker',
          compactLabel: 'Add Data 360',
          summary: 'Allow users to search connected Data 360 content.',
          whyItMatters:
            'Extends search to unified and external data managed in Data 360.',
        },
        {
          id: 'af-next-recent',
          order: 3,
          gating: 'optional',
          title: 'Turn on recent searches',
          compactLabel: 'Recent searches',
          summary: "Displays users' recent searches in the search bar.",
          whyItMatters: 'Speeds up repeat lookups for busy users.',
        },
        {
          id: 'af-next-customize',
          order: 4,
          gating: 'optional',
          title: 'Customize results and layout',
          compactLabel: 'Customize results',
          summary:
            'Control which fields appear in search and how results are arranged.',
          whyItMatters:
            'Tailors results to the fields your users actually care about.',
        },
      ],
      checklist: [],
    },
  ],

  validation: [
    {
      id: 'af-val-access',
      label: 'User has access',
      how: 'The assigned user can open Agentforce Coworker in Salesforce.',
      relatedStepId: 'af-t-step8',
    },
    {
      id: 'af-val-searchbar',
      label: 'Search bar available',
      how: 'The Global Search Bar (Beta) experience is visible for the user.',
      relatedStepId: 'af-t-step6',
    },
    {
      id: 'af-val-testsearch',
      label: 'Test search completed',
      how: 'A search was run from the global search bar.',
      relatedStepId: 'af-validate',
    },
    {
      id: 'af-val-results',
      label: 'Results displayed',
      how: 'Search results displayed as expected.',
      relatedStepId: 'af-validate',
    },
  ],
};
