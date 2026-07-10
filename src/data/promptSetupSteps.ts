// ============================================================================
// Journey 2 — Use Personalized AI Prompts.
// "Prompt Setup Instructions: Schedule-Triggered Flow + Prompt Builder"
// Content transcribed from the "Automated AI Use case" Admin Guide PDF.
// Object: Account · Use case: AI-powered meeting briefings · v1.0 - June 2026.
// ============================================================================

import type { Journey } from '../lib/types';

// The Account Summary Prompt text is used verbatim in Step 3 (Phase 2).
const ACCOUNT_SUMMARY_PROMPT = `You are a helpful account manager assistant preparing a briefing.

Based on the account data below, generate a concise HTML briefing that includes:
1. Account overview (industry, region, size)
2. Recent activity summary (opportunities, tasks, events)
3. Key talking points for the upcoming meeting
4. Potential risks or opportunities to address

Keep it under 200 words. Use clean HTML with bullet points and bold headers.

The response should be in EN_US.

Do not wrap the HTML in markdown, code fences, or quotation marks.

-----DATA-----
{!$RecordSnapshot:Account.Snapshot}

Now generate only the HTML rich text.`;

const FAULT_EMAIL_BODY = `The scheduled Account Summary flow failed.

Account Id: {!$Record.Id}
Account Name: {!$Record.Name}

Please check Setup > Paused and Failed Flow Interviews for more details.`;

export const promptsJourney: Journey = {
  id: 'prompts',
  title: 'Use Personalized AI Prompts',
  tagline:
    'Create an Account Meeting Briefing using Prompt Builder and a Schedule-Triggered Flow.',
  icon: 'sparkles',
  difficulty: 'Beginner to Intermediate Admin',
  purpose:
    'Schedule automated flows that leverage Salesforce AI (Prompt Builder) to generate briefings, summaries, and recommendations — then store the results directly on your records.',
  includes: [
    'Permissions',
    'Rich text field',
    'Record snapshot',
    'Prompt template',
    'Flow',
    'Testing',
    'Monitoring',
  ],
  sections: [
    // ------------------------------------------------------- Phase 0
    {
      id: 'phase-0',
      title: 'Prerequisites',
      phaseNumber: 0,
      doneWhen:
        'Edition, Einstein, permission sets, Default Workflow User, and field plan are confirmed.',
      intro:
        'A go/no-go gate. Confirm every item below before you build anything — each one blocks Prompt Builder or the flow if it is missing.',
      steps: [
        {
          id: 'p0-gonogo',
          order: 1,
          gating: 'required',
          title: 'Go / No-Go checklist',
          compactLabel: 'Confirm prerequisites',
          summary:
            'Confirm your org edition, Einstein, permission sets, Default Workflow User, and the custom field plan.',
          valuesToEnter: [
            { field: 'Edition', value: 'Enterprise, Unlimited, or Performance' },
            { field: 'Einstein', value: 'Enabled at Setup > Einstein Setup' },
            {
              field: 'Permission set',
              value: 'EinsteinGPTPromptTemplateManager',
              copyable: true,
            },
            {
              field: 'Permission set',
              value: 'EinsteinGPTPromptTemplateUser',
              copyable: true,
            },
            {
              field: 'Default Workflow User',
              value: 'Configured at Setup > Process Automation Settings',
            },
            {
              field: 'Custom field',
              value: 'Create a Rich Text Area field on the target object of your prompt (e.g. Account_Meeting_Briefing__c on Account for a meeting briefing)',
              copyable: true,
            },
          ],
          whyItMatters:
            'Missing any prerequisite causes confusing failures later — a "Page not found" in Prompt Builder, or a flow that runs as the wrong user and sees no data.',
        },
        {
          id: 'p0-assign-permsets',
          order: 2,
          gating: 'required',
          title: 'Assign permission sets',
          compactLabel: 'Assign Prompt Template permission sets',
          summary:
            'Assign both EinsteinGPT Prompt Template permission sets to your user so Prompt Builder opens.',
          navPath: {
            segments: ['Setup', 'Permission Sets'],
            quickFind: 'Permission Sets',
          },
          instructions: [
            'Go to Setup > Permission Sets.',
            'Search for EinsteinGPTPromptTemplateManager.',
            'Open the permission set.',
            'Click Manage Assignments.',
            'Add your user.',
            'Repeat for EinsteinGPTPromptTemplateUser.',
          ],
          copyBlocks: [
            {
              id: 'p0-ps-manager',
              label: 'Permission set (Manager)',
              value: 'EinsteinGPTPromptTemplateManager',
              kind: 'apiName',
            },
            {
              id: 'p0-ps-user',
              label: 'Permission set (User)',
              value: 'EinsteinGPTPromptTemplateUser',
              kind: 'apiName',
            },
          ],
          whyItMatters:
            'These two permission sets grant access to Prompt Builder and the templates it manages.',
          warnings: [
            {
              id: 'p0-ps-w1',
              level: 'warning',
              title: 'Missing permission sets → "Page not found"',
              body: 'Without these permission sets, Prompt Builder can show "Page not found".',
            },
          ],
        },
        {
          id: 'p0-default-workflow-user',
          order: 3,
          gating: 'required',
          title: 'Understand the Default Workflow User',
          compactLabel: 'Check Default Workflow User',
          summary:
            'For flows on API version 53.0+, the flow runs as the Default Workflow User — and that user determines what data the Record Snapshot can see.',
          navPath: {
            segments: [
              'Setup',
              'Process Automation Settings',
              'Default Workflow User',
            ],
            quickFind: 'Process Automation Settings',
          },
          instructions: [
            'Open Setup > Process Automation Settings.',
            'Note the Default Workflow User.',
            'Remember: this user (not Automated Process) is who the scheduled flow runs as.',
          ],
          whyItMatters:
            'The Default Workflow User affects which Account fields and related lists the Record Snapshot can access. If that user cannot see a field, the prompt never receives it.',
          beginnerTip:
            'For flows on API version 53.0 and later, the flow runs as the Default Workflow User, not the Automated Process user.',
        },
      ],
      checklist: [
        {
          id: 'p0-ck-edition',
          label: 'Org edition is Enterprise, Unlimited, or Performance.',
          blocking: true,
        },
        {
          id: 'p0-ck-einstein',
          label: 'Einstein is enabled.',
          blocking: true,
        },
        {
          id: 'p0-ck-permsets',
          label:
            'Both EinsteinGPTPromptTemplateManager and EinsteinGPTPromptTemplateUser are assigned.',
          blocking: true,
        },
        {
          id: 'p0-ck-dwu',
          label: 'Default Workflow User is configured and identified.',
          blocking: true,
        },
        {
          id: 'p0-ck-field-plan',
          label: 'Custom field is planned as a Rich Text Area.',
          blocking: false,
        },
      ],
    },

    // ------------------------------------------------------- Phase 1
    {
      id: 'phase-1',
      title: 'Prepare Account data',
      phaseNumber: 1,
      doneWhen:
        'Rich Text field exists and the page layout exposes the data needed by Record Snapshot.',
      intro:
        'Create the field that stores the generated briefing, then make sure the Account layout the Default Workflow User sees exposes everything the prompt needs.',
      steps: [
        {
          id: 'p1-create-field',
          order: 1,
          gating: 'required',
          title: 'Step 1 — Create the custom field on Account',
          compactLabel: 'Create Rich Text field',
          summary:
            'Add a Rich Text Area field to Account to store the HTML the prompt generates.',
          navPath: {
            segments: [
              'Setup',
              'Object Manager',
              'Account',
              'Fields & Relationships',
              'New',
            ],
            quickFind: 'Object Manager',
          },
          instructions: [
            'Choose Rich Text Area.',
            'Enter label: Account Meeting Briefing.',
            'Set length and visible lines.',
            'Click Next through field-level security.',
            'Add the field to the relevant page layout(s).',
            'Click Save.',
          ],
          valuesToEnter: [
            { field: 'Label', value: 'Account Meeting Briefing', copyable: true },
            {
              field: 'API Name',
              value: 'Account_Meeting_Briefing__c',
              copyable: true,
            },
            { field: 'Type', value: 'Rich Text Area' },
            { field: 'Length', value: '32768 (or your preferred maximum)' },
            { field: 'Visible Lines', value: '10' },
            { field: 'Purpose', value: 'Stores the HTML generated by the prompt' },
          ],
          copyBlocks: [
            {
              id: 'p1-field-api',
              label: 'Field API Name',
              value: 'Account_Meeting_Briefing__c',
              kind: 'apiName',
            },
          ],
          whyItMatters:
            'The prompt writes clean HTML; only a Rich Text Area renders it. A Long Text Area would show raw HTML tags.',
          warnings: [
            {
              id: 'p1-field-w1',
              level: 'warning',
              title: 'Must be Rich Text Area',
              body: 'If you create a Long Text Area by mistake, the field will show raw HTML tags. Recreate it as Rich Text Area.',
            },
          ],
        },
        {
          id: 'p1-prepare-layout',
          order: 2,
          gating: 'required',
          title: 'Step 2 — Prepare the Account page layout for Record Snapshot',
          compactLabel: 'Expose fields on layout',
          summary:
            'Record Snapshot reads the layout the Default Workflow User sees. Add every field and related list the prompt needs.',
          navPath: {
            segments: ['Setup', 'Object Manager', 'Account', 'Page Layouts'],
            quickFind: 'Object Manager',
          },
          instructions: [
            'Open the Account page layout assigned to the Default Workflow User profile.',
            'Add the required fields and related lists if missing.',
            'Save the layout.',
          ],
          valuesToEnter: [
            {
              field: 'Required fields',
              value:
                'Account Name, Account Id, Industry, Region, Customer Since, Description',
            },
            { field: 'Required related lists', value: 'Opportunities, Tasks, Events' },
            {
              field: 'Assigned layout',
              value: 'The layout assigned to the Default Workflow User profile',
            },
          ],
          copyBlocks: [
            {
              id: 'p1-snapshot-token',
              label: 'Record Snapshot token',
              value: '{!$RecordSnapshot:Account.Snapshot}',
              kind: 'flowRef',
            },
          ],
          whyItMatters:
            'Record Snapshot uses the page layout visible to the Default Workflow User. If a field or related list is missing from that layout, the prompt will not receive that data.',
          beginnerTip:
            'Key idea: the Record Snapshot can only use data visible to the Default Workflow User on the relevant Account layout.',
        },
      ],
      checklist: [
        {
          id: 'p1-ck-field',
          label: 'Account_Meeting_Briefing__c exists as a Rich Text Area.',
          blocking: true,
        },
        {
          id: 'p1-ck-layout-fields',
          label:
            'Layout includes Account Name, Account Id, Industry, Region, Customer Since, Description.',
          blocking: true,
        },
        {
          id: 'p1-ck-layout-lists',
          label: 'Layout includes Opportunities, Tasks, and Events related lists.',
          blocking: true,
        },
      ],
    },

    // ------------------------------------------------------- Phase 2
    {
      id: 'phase-2',
      title: 'Build the prompt',
      phaseNumber: 2,
      doneWhen:
        'Field Generation prompt template is created, tested, saved, and activated.',
      intro:
        'Create a Field Generation prompt template that writes the LLM response directly into your new field, then test and activate it.',
      steps: [
        {
          id: 'p2-create-template',
          order: 1,
          gating: 'required',
          title: 'Step 3 — Create the prompt template in Prompt Builder',
          compactLabel: 'Create prompt template',
          summary:
            'Create a Field Generation template targeting the Account_Meeting_Briefing__c field, then paste the prompt text.',
          navPath: {
            segments: [
              'Setup',
              'Search Setup bar',
              'Prompt Builder',
              'Einstein',
              'Einstein Generative AI',
            ],
            quickFind: 'Prompt Builder',
          },
          instructions: [
            'Click New Prompt Template.',
            'Select Field Generation.',
            'Fill in Template Name, API Name, Object, and Target Field (see values).',
            'Paste the prompt text into the template.',
          ],
          valuesToEnter: [
            { field: 'Template Name', value: 'Account Summary Prompt', copyable: true },
            { field: 'API Name', value: 'Account_Summary_Prompt', copyable: true },
            { field: 'Object', value: 'Account' },
            {
              field: 'Target Field',
              value: 'Account_Meeting_Briefing__c',
              copyable: true,
            },
          ],
          copyBlocks: [
            {
              id: 'p2-template-api',
              label: 'Template API Name',
              value: 'Account_Summary_Prompt',
              kind: 'apiName',
            },
            {
              id: 'p2-prompt-text',
              label: 'Account Summary Prompt (full prompt text)',
              value: ACCOUNT_SUMMARY_PROMPT,
              kind: 'promptText',
            },
          ],
          whyItMatters:
            'Field Generation is designed to write the LLM response directly into a field on a Salesforce record.',
          beginnerTip:
            'Prompt Builder may not appear in Quick Find. Use the top Search Setup bar instead.',
          warnings: [
            {
              id: 'p2-prompt-critical',
              level: 'warning',
              title: 'Keep the "no code fences" line',
              body: 'Keep the line "Do not wrap the HTML in markdown, code fences, or quotation marks." It helps prevent broken Rich Text rendering.',
            },
          ],
        },
        {
          id: 'p2-test-activate',
          order: 2,
          gating: 'required',
          title: 'Test and activate the prompt template',
          compactLabel: 'Test & activate template',
          summary:
            'Preview against a rich Account, confirm clean HTML, then Save and Activate.',
          instructions: [
            'Click Preview.',
            'Test with an Account that has Opportunities, Tasks, and Events.',
            'Verify the response is clean HTML with no code fences.',
            'Click Save.',
            'Click Activate.',
          ],
          passCriteria:
            'Preview returns clean HTML (no code fences) and the template is Activated.',
          whyItMatters:
            'The template must be activated before it appears as an action in Flow Builder.',
          warnings: [
            {
              id: 'p2-activate-w1',
              level: 'blocker',
              title: 'Activate before building the flow',
              body: 'The prompt template must be activated before it appears as an action in Flow Builder.',
            },
          ],
        },
      ],
      checklist: [
        {
          id: 'p2-ck-created',
          label: 'Field Generation template "Account Summary Prompt" created.',
          blocking: true,
        },
        {
          id: 'p2-ck-clean-html',
          label: 'Preview returned clean HTML with no code fences.',
          blocking: true,
        },
        {
          id: 'p2-ck-activated',
          label: 'Template is saved and activated.',
          blocking: true,
        },
      ],
    },

    // ------------------------------------------------------- Phase 3
    {
      id: 'phase-3',
      title: 'Build the flow',
      phaseNumber: 3,
      doneWhen:
        'Scheduled flow runs the prompt, checks the response, updates the Account, and has fault handling.',
      intro:
        'Build a Schedule-Triggered Flow that finds target Accounts, runs the prompt action, checks the response, updates the field, and emails you on failure.',
      steps: [
        {
          id: 'p3-create-flow',
          order: 1,
          gating: 'required',
          title: 'Step 4 — Create the Schedule-Triggered Flow',
          compactLabel: 'Create scheduled flow',
          summary:
            'Create a Schedule-Triggered Flow, set it to run daily before users arrive, and filter to a small set of Accounts to start.',
          navPath: {
            segments: [
              'Setup',
              'Flows',
              'New Flow',
              'Schedule-Triggered Flow',
              'Create',
            ],
            quickFind: 'Flows',
          },
          instructions: [
            'Create a new Schedule-Triggered Flow.',
            'Configure the Start element schedule (see values).',
            'Set the Object to Account and add a restrictive filter.',
          ],
          valuesToEnter: [
            { field: 'Start Date', value: 'Tomorrow or a future date' },
            { field: 'Start Time', value: '06:30, before users arrive' },
            { field: 'Frequency', value: 'Daily' },
            { field: 'Object', value: 'Account' },
            { field: 'Condition Requirements', value: 'All Conditions Are Met' },
            { field: 'Example Filter', value: 'Industry Does Not Equal Blank' },
          ],
          whyItMatters:
            'A schedule plus a restrictive filter lets you prove the automation on a few Accounts before it touches your whole org.',
          beginnerTip:
            'Start with a restrictive filter such as Owner or Industry. Test with a few Accounts first, then expand.',
          warnings: [
            {
              id: 'p3-tz-tip',
              level: 'tip',
              title: 'Time zone',
              body: 'Scheduled time uses the org default time zone, not the personal user time zone. Check Setup > Company Information > Default Time Zone.',
            },
          ],
        },
        {
          id: 'p3-prompt-action',
          order: 2,
          gating: 'required',
          title: 'Step 5 — Add the Prompt Template Action',
          compactLabel: 'Add prompt action + RelatedEntity',
          summary:
            'Add the prompt action, then set its RelatedEntity input using a manually-typed JSON value — not the resource picker.',
          instructions: [
            'Click + after Start.',
            'Select Action.',
            'Search for Account Summary Prompt.',
            'Select the action for your template.',
            'For RelatedEntity, switch the field to text/formula mode and type the JSON value manually.',
          ],
          copyBlocks: [
            {
              id: 'p3-relatedentity',
              label: 'RelatedEntity input (type in text/formula mode)',
              value: '{"Id":"{!$Record.Id}"}',
              kind: 'json',
            },
            {
              id: 'p3-output-ref',
              label: 'Automatic output — Prompt Response',
              value: '{!Run_Account_Summary_Prompt.PromptResponse}',
              kind: 'flowRef',
            },
            {
              id: 'p3-adv-var',
              label: 'Optional advanced variable',
              value: 'varAccountBriefingHtml',
              kind: 'apiName',
            },
          ],
          whyItMatters:
            'Prompt Response is the generated HTML text. The Prompt Generation ID is technical and usually not needed.',
          warnings: [
            {
              id: 'p3-relatedentity-w1',
              level: 'blocker',
              title: 'Do not pick $Record directly',
              body: 'Do not select Triggering Account or $Record directly from the resource picker — that causes the RelatedEntity format error. Switch to text/formula mode and type {"Id":"{!$Record.Id}"} manually.',
            },
          ],
        },
        {
          id: 'p3-decision',
          order: 3,
          gating: 'required',
          title: 'Step 6 — Add a Decision element',
          compactLabel: 'Add "was response generated?" decision',
          summary:
            'Check that the prompt returned a response before updating the Account, so you never overwrite the field with a blank value.',
          instructions: [
            'Click + after the Action.',
            'Select Decision.',
            'Configure the decision as shown in the values.',
          ],
          valuesToEnter: [
            { field: 'Decision Label', value: 'Was Prompt Response Generated?' },
            { field: 'Positive Outcome Label', value: 'Generated' },
            {
              field: 'Resource',
              value: '{!Run_Account_Summary_Prompt.PromptResponse}',
              copyable: true,
            },
            { field: 'Operator', value: 'Is Null' },
            { field: 'Value', value: '{!$GlobalConstant.False}', copyable: true },
            { field: 'Default Outcome Label', value: 'No Response' },
          ],
          copyBlocks: [
            {
              id: 'p3-decision-resource',
              label: 'Decision resource',
              value: '{!Run_Account_Summary_Prompt.PromptResponse}',
              kind: 'flowRef',
            },
            {
              id: 'p3-decision-value',
              label: 'Decision value',
              value: '{!$GlobalConstant.False}',
              kind: 'flowRef',
            },
          ],
          whyItMatters:
            'If Prompt Response is not null, continue to Generated. If there is no response, do nothing and let the flow move to the next Account — this avoids overwriting the field with a blank value.',
        },
        {
          id: 'p3-update',
          order: 4,
          gating: 'required',
          title: 'Step 7 — Update the Account on the Generated path',
          compactLabel: 'Update Account field',
          summary:
            'On the Generated path, write the prompt response into the briefing field on the current Account.',
          instructions: [
            'On the Generated path, click +.',
            'Select Update Records.',
            'Label it: Update Account with Briefing.',
            'For How to Find Records, select "Use the account $Record global variable".',
            'Set Account_Meeting_Briefing__c = {!Run_Account_Summary_Prompt.PromptResponse}.',
          ],
          valuesToEnter: [
            { field: 'Label', value: 'Update Account with Briefing' },
            {
              field: 'How to Find Records',
              value: 'Use the account $Record global variable',
            },
            {
              field: 'Account_Meeting_Briefing__c',
              value: '{!Run_Account_Summary_Prompt.PromptResponse}',
              copyable: true,
            },
          ],
          copyBlocks: [
            {
              id: 'p3-update-value',
              label: 'Field value',
              value: '{!Run_Account_Summary_Prompt.PromptResponse}',
              kind: 'flowRef',
            },
          ],
          whyItMatters:
            'Using the account $Record global variable updates the current Account being processed by the scheduled flow.',
        },
        {
          id: 'p3-fault',
          order: 5,
          gating: 'required',
          title: 'Step 8 — Add fault handling',
          compactLabel: 'Add fault paths + email',
          summary:
            'Add a fault path from both the Prompt action and the Update Records element that emails an admin on failure.',
          instructions: [
            'Click the element (Prompt Template Action).',
            'Select Add Fault Path.',
            'On the Fault Path, add a Send Email action.',
            'Repeat for the Update Records element.',
          ],
          valuesToEnter: [
            { field: 'To', value: 'Salesforce admin email address' },
            {
              field: 'Subject',
              value: 'Account Summary Scheduled Flow Failed',
              copyable: true,
            },
          ],
          copyBlocks: [
            {
              id: 'p3-fault-subject',
              label: 'Email subject',
              value: 'Account Summary Scheduled Flow Failed',
              kind: 'value',
            },
            {
              id: 'p3-fault-body',
              label: 'Email body',
              value: FAULT_EMAIL_BODY,
              kind: 'code',
            },
          ],
          whyItMatters:
            'A fault path on both the Prompt action and the Update element means you hear about failures instead of silently producing no briefing.',
          beginnerTip:
            'An email alert is enough to start. Later, admins can create a custom object such as Automation Error Log for structured tracking.',
          warnings: [
            {
              id: 'p3-fault-w1',
              level: 'warning',
              title: 'Both elements need a fault path',
              body: 'Add a fault path from BOTH the Prompt Template Action and the Update Records element.',
            },
          ],
        },
        {
          id: 'p3-save',
          order: 6,
          gating: 'required',
          title: 'Step 9 — Save the flow',
          compactLabel: 'Save (do not activate)',
          summary:
            'Save with a clear label and API name — but do not activate yet. Test in Sandbox first.',
          instructions: [
            'Click Save.',
            'Enter the Flow Label and Flow API Name (see values).',
          ],
          valuesToEnter: [
            { field: 'Flow Label', value: 'Daily Account Meeting Briefing', copyable: true },
            {
              field: 'Flow API Name',
              value: 'Daily_Account_Meeting_Briefing',
              copyable: true,
            },
          ],
          copyBlocks: [
            {
              id: 'p3-flow-api',
              label: 'Flow API Name',
              value: 'Daily_Account_Meeting_Briefing',
              kind: 'apiName',
            },
          ],
          whyItMatters:
            'Saving preserves your work; delaying activation prevents an untested flow from touching production data.',
          warnings: [
            {
              id: 'p3-save-w1',
              level: 'warning',
              title: 'Do not activate yet',
              body: 'Save the flow, but test in Sandbox before activating the production-ready daily schedule.',
            },
          ],
        },
      ],
      checklist: [
        {
          id: 'p3-ck-field',
          label:
            'Custom field exists: Account_Meeting_Briefing__c is Rich Text Area on Account.',
          blocking: true,
        },
        {
          id: 'p3-ck-snapshot',
          label:
            'Record Snapshot can see data: Default Workflow User layout includes required fields and related lists.',
          blocking: true,
        },
        {
          id: 'p3-ck-active',
          label: 'Prompt template is active (tested, saved, activated).',
          blocking: true,
        },
        {
          id: 'p3-ck-relatedentity',
          label: 'RelatedEntity uses {"Id":"{!$Record.Id}"} in text/formula mode.',
          blocking: true,
        },
        {
          id: 'p3-ck-decision',
          label: 'Generated decision checks Prompt Response for not null before update.',
          blocking: true,
        },
        {
          id: 'p3-ck-fault',
          label:
            'Fault paths on both the Prompt Action and Update Records send an admin email.',
          blocking: true,
        },
      ],
    },

    // ------------------------------------------------------- Phase 4
    {
      id: 'phase-4',
      title: 'Test in Sandbox',
      phaseNumber: 4,
      doneWhen:
        'Sandbox test uses a restrictive filter and a one-time schedule close to now.',
      intro:
        'Never build directly in Production. Run one safe, one-time test in a Sandbox and confirm the field fills with clean HTML.',
      steps: [
        {
          id: 'p4-safe-test',
          order: 1,
          gating: 'required',
          title: 'Step 10 — Run a safe test',
          compactLabel: 'Run one-time Sandbox test',
          summary:
            'Pick a rich test Account, set the flow to run Once close to now, activate, then confirm the field fills.',
          instructions: [
            'Create or pick a test Account.',
            'Fill in Industry, Region, and Description.',
            'Add Opportunities, Tasks, and Events.',
            'Verify the Account matches the Start filters.',
            'Set the flow to Once at a time close to now.',
            'Activate the flow.',
            'Wait for execution and check Setup > Scheduled Jobs.',
            'Open the Account and confirm Account_Meeting_Briefing__c contains clean HTML.',
          ],
          passCriteria:
            'Account_Meeting_Briefing__c contains clean HTML after the run.',
          whyItMatters:
            'A one-time run close to now gives fast feedback without waiting for the daily schedule, and a restrictive filter limits blast radius.',
          beginnerTip:
            'Debugging schedule-triggered flows is limited. For record-level testing, build a separate Autolaunched Flow with the same logic but no Start element, call it as a Subflow, and debug the subflow by choosing the record.',
          warnings: [
            {
              id: 'p4-critical',
              level: 'blocker',
              title: 'Never build in Production',
              body: 'Always test in a Sandbox first.',
            },
            {
              id: 'p4-norun',
              level: 'tip',
              title: 'Flow does not run?',
              body: 'Check Setup > Scheduled Jobs. Confirm the flow has a Next Scheduled Run. If Started is blank, it has not reached its scheduled time yet. Confirm the org time zone if the run time looks wrong.',
            },
          ],
        },
      ],
      checklist: [
        {
          id: 'p4-ck-sandbox',
          label: 'Testing in a Sandbox (not Production).',
          blocking: true,
        },
        {
          id: 'p4-ck-test-account',
          label:
            'Test Account has Industry, Region, Description, plus Opportunities, Tasks, Events.',
          blocking: true,
        },
        {
          id: 'p4-ck-once',
          label: 'Flow set to Once at a time close to now.',
          blocking: true,
        },
        {
          id: 'p4-ck-clean-html',
          label: 'Account_Meeting_Briefing__c contains clean HTML after the run.',
          blocking: true,
        },
      ],
    },

    // ------------------------------------------------------- Phase 5
    {
      id: 'phase-5',
      title: 'Activate and monitor',
      phaseNumber: 5,
      doneWhen:
        'Flow is daily, active, and monitored through Scheduled Jobs, Failed Flow Interviews, and admin emails.',
      intro:
        'Switch the schedule back to Daily, activate, and set up your monitoring routine. Roll out gradually.',
      steps: [
        {
          id: 'p5-activate',
          order: 1,
          gating: 'required',
          title: 'Step 11 — Activate after tests pass',
          compactLabel: 'Set Daily & activate',
          summary:
            'Return the frequency to Daily and activate the flow, then monitor it.',
          instructions: ['Set frequency back to Daily.', 'Click Activate.'],
          valuesToEnter: [
            { field: 'Scheduled Jobs', value: 'Setup > Scheduled Jobs' },
            {
              field: 'Failed Interviews',
              value: 'Setup > Paused and Failed Flow Interviews',
            },
            { field: 'Error Emails', value: 'Admin email inbox' },
            {
              field: 'Generated Result',
              value: 'Account > Account Meeting Briefing field',
            },
          ],
          whyItMatters:
            'Daily + active is the production state; monitoring the three surfaces catches problems early.',
          beginnerTip:
            'Start with a small group of Accounts. Expand gradually after confirming performance, output quality, and error handling.',
        },
      ],
      checklist: [
        {
          id: 'p5-ck-daily',
          label: 'Frequency set back to Daily and flow activated.',
          blocking: true,
        },
        {
          id: 'p5-ck-jobs',
          label: 'Confirmed a Next Scheduled Run in Setup > Scheduled Jobs.',
          blocking: true,
        },
        {
          id: 'p5-ck-monitoring',
          label:
            'Monitoring routine set: Scheduled Jobs, Failed Interviews, and admin emails.',
          blocking: false,
        },
      ],
    },
  ],

  validation: [
    {
      id: 'p-val-field',
      label: 'Field exists',
      how: 'Account_Meeting_Briefing__c exists as a Rich Text Area on Account.',
      relatedStepId: 'p1-create-field',
    },
    {
      id: 'p-val-prompt',
      label: 'Prompt active',
      how: 'Account Summary Prompt was tested, saved, and activated.',
      relatedStepId: 'p2-test-activate',
    },
    {
      id: 'p-val-flow',
      label: 'Flow saved',
      how: 'Daily Account Meeting Briefing flow is saved with fault handling.',
      relatedStepId: 'p3-save',
    },
    {
      id: 'p-val-sandbox',
      label: 'Sandbox test passed',
      how: 'A one-time Sandbox run filled the field with clean HTML.',
      relatedStepId: 'p4-safe-test',
    },
    {
      id: 'p-val-monitoring',
      label: 'Monitoring enabled',
      how: 'Scheduled Jobs, Failed Flow Interviews, and admin emails are being monitored.',
      relatedStepId: 'p5-activate',
    },
  ],
};
