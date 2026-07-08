// ============================================================================
// Quick Reference tables for Journey 2 (best practices, common errors, limits).
// Transcribed from the Admin Guide PDF.
// ============================================================================

export interface BestPractice {
  practice: string;
  why: string;
}

export interface CommonError {
  error: string;
  cause: string;
  fix: string;
}

export interface LimitRow {
  limit: string;
  value: string;
}

export const bestPractices: BestPractice[] = [
  {
    practice: 'Add a Decision element',
    why: 'Prevents overwriting the field with an empty value.',
  },
  {
    practice: 'Implement a Fault Path',
    why: 'Alerts the admin when prompt generation or update fails.',
  },
  {
    practice: 'Verify the Default Workflow User page layout',
    why: 'Record Snapshot depends on that layout.',
  },
  {
    practice: 'Schedule during off-hours',
    why: 'Helps avoid record locking conflicts.',
  },
  {
    practice: 'Always build in Sandbox first',
    why: 'Prevents production mistakes.',
  },
  {
    practice: 'Start small with restrictive filters',
    why: 'Reduces volume and makes testing easier.',
  },
  {
    practice: 'Add "Do not wrap in code fences" to the prompt',
    why: 'Prevents broken HTML in Rich Text.',
  },
  {
    practice: 'Assign permission sets before starting',
    why: 'Required for Prompt Builder access.',
  },
];

export const commonErrors: CommonError[] = [
  {
    error: 'RelatedEntity value has an incorrect format',
    cause: 'Passing $Record directly instead of JSON.',
    fix: 'Use {"Id":"{!$Record.Id}"} in text/formula mode.',
  },
  {
    error: 'Prompt Builder shows Page not found',
    cause: 'Missing permission sets.',
    fix: 'Assign EinsteinGPTPromptTemplateManager and EinsteinGPTPromptTemplateUser.',
  },
  {
    error: 'Template not showing in Flow Builder actions',
    cause: 'Template not activated.',
    fix: 'Go to Prompt Builder and click Activate.',
  },
  {
    error: 'Flow not running at expected time',
    cause: 'Time zone mismatch.',
    fix: 'Check org time zone in Setup > Company Information.',
  },
  {
    error: 'Scheduled Job shows no Started date',
    cause: 'Flow has not reached its scheduled time yet.',
    fix: 'Wait, or set to Once with a closer time.',
  },
  {
    error: 'Rich Text field shows raw HTML tags',
    cause: 'Field type is Long Text Area.',
    fix: 'Recreate the field as Rich Text Area.',
  },
  {
    error: 'Start date is in the past warning',
    cause: 'Schedule date already passed.',
    fix: 'Update Start Date to a future date.',
  },
];

export const limits: LimitRow[] = [
  { limit: 'Max records per execution', value: '50,000' },
  { limit: 'Batch size', value: '200 records at a time' },
  { limit: 'Interviews per 24 hours', value: '250,000, or user licenses × 200' },
  { limit: 'Available frequencies', value: 'Daily, Weekly, Once' },
];

export const limitsNote =
  'For high volumes, Salesforce supports Prompt Template Batch Processing to generate responses asynchronously via Flow or Apex.';
