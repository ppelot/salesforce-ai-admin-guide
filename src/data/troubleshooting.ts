// ============================================================================
// Troubleshooting entries for both journeys. Transcribed from the Admin Guide.
// ============================================================================

import type { TroubleshootingEntry } from '../lib/types';

export const troubleshooting: TroubleshootingEntry[] = [
  // --- Journey 1: Agentforce Coworker -------------------------------------
  {
    id: 'ts-af-button',
    journeyId: 'agentforce',
    symptom: 'Coworker button not showing up',
    cause:
      'The end-user experience step may be incomplete, or the user is in the wrong app.',
    fix: 'Make sure Step 6 was completed — especially clicking Manage and accepting the Beta terms. Confirm the user is in a Sales Console or Service Console, not a standard Lightning app. Try a hard refresh.',
    relatedStepId: 'af-t-step6',
    tags: ['agentforce', 'search bar', 'beta', 'console'],
  },
  {
    id: 'ts-af-toggle',
    journeyId: 'agentforce',
    symptom: 'Agentforce toggle not visible in Agent Studio',
    cause: 'Einstein AI has not been turned on.',
    fix: 'Einstein AI must be turned on first. Go to Einstein Setup and enable it, then refresh.',
    relatedStepId: 'af-enable-einstein',
    tags: ['agentforce', 'einstein', 'agent studio'],
  },
  {
    id: 'ts-af-greyed',
    journeyId: 'agentforce',
    symptom: '"Turn On" button is greyed out',
    cause: 'Data Cloud has not finished provisioning.',
    fix: 'Go back to Data Cloud Setup Home and wait for provisioning to complete, then return.',
    relatedStepId: 'af-enable-data360',
    tags: ['data cloud', 'data 360', 'provisioning'],
  },
  {
    id: 'ts-af-permsets',
    journeyId: 'agentforce',
    symptom: 'Permission sets not visible',
    cause: 'The org may still use the older permission-set naming.',
    fix: 'Search for "Ask Agentforce" — the permission sets may still use the older name.',
    relatedStepId: 'af-confirm-permsets',
    tags: ['permissions', 'permission sets', 'ask agentforce'],
  },
  {
    id: 'ts-af-license',
    journeyId: 'agentforce',
    symptom: 'License errors',
    cause: 'The org license may not include Agentforce Coworker.',
    fix: 'Contact your Salesforce Account Executive or Customer Success Manager to verify the license includes Agentforce Coworker.',
    tags: ['license', 'entitlement'],
  },

  // --- Journey 2: Prompt Flow ---------------------------------------------
  {
    id: 'ts-p-relatedentity',
    journeyId: 'prompts',
    symptom: 'RelatedEntity value has an incorrect format',
    cause: 'Passing $Record directly instead of JSON.',
    fix: 'Switch the field to text/formula mode and type {"Id":"{!$Record.Id}"} manually.',
    relatedStepId: 'p3-prompt-action',
    tags: ['flow', 'relatedentity', 'json', 'prompt action'],
  },
  {
    id: 'ts-p-pagenotfound',
    journeyId: 'prompts',
    symptom: 'Prompt Builder shows "Page not found"',
    cause: 'Missing permission sets.',
    fix: 'Assign EinsteinGPTPromptTemplateManager and EinsteinGPTPromptTemplateUser to your user.',
    relatedStepId: 'p0-assign-permsets',
    tags: ['prompt builder', 'permissions', 'page not found'],
  },
  {
    id: 'ts-p-notinflow',
    journeyId: 'prompts',
    symptom: 'Template not showing in Flow Builder actions',
    cause: 'Template not activated.',
    fix: 'Go to Prompt Builder and click Activate on the template.',
    relatedStepId: 'p2-test-activate',
    tags: ['flow', 'prompt template', 'activate'],
  },
  {
    id: 'ts-p-timezone',
    journeyId: 'prompts',
    symptom: 'Flow not running at expected time',
    cause: 'Time zone mismatch.',
    fix: 'Check the org time zone in Setup > Company Information > Default Time Zone.',
    relatedStepId: 'p3-create-flow',
    tags: ['flow', 'schedule', 'time zone'],
  },
  {
    id: 'ts-p-nostarted',
    journeyId: 'prompts',
    symptom: 'Scheduled Job shows no Started date',
    cause: 'The flow has not reached its scheduled time yet.',
    fix: 'Wait, or set the flow to Once with a closer time.',
    relatedStepId: 'p4-safe-test',
    tags: ['flow', 'scheduled jobs', 'schedule'],
  },
  {
    id: 'ts-p-rawhtml',
    journeyId: 'prompts',
    symptom: 'Rich Text field shows raw HTML tags',
    cause: 'The field type is Long Text Area.',
    fix: 'Recreate the field as a Rich Text Area.',
    relatedStepId: 'p1-create-field',
    tags: ['rich text', 'field', 'html'],
  },
  {
    id: 'ts-p-pastdate',
    journeyId: 'prompts',
    symptom: 'Start date is in the past warning',
    cause: 'The schedule date has already passed.',
    fix: 'Update the Start Date to a future date.',
    relatedStepId: 'p3-create-flow',
    tags: ['flow', 'schedule', 'start date'],
  },
];
