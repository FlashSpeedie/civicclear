import { DocumentAnalysis } from '@/types';
import { SAMPLE_SOURCE_BLOCKS } from './sample-document';

export const SAMPLE_ANALYSIS: DocumentAnalysis = {
  documentTitle: 'Meridian Founders Scholarship — Application Instructions',
  documentType: 'Scholarship application instructions',
  oneSentenceSummary: 'The Meridian Founders Scholarship offers up to $5,000/year for students with a 3.5+ GPA, financial need, and 50+ community service hours, with applications due March 15, 2024.',
  plainEnglishSummary: 'This document explains how to apply for the Meridian Founders Scholarship at Meridian Community College. The scholarship provides up to $5,000 per academic year for students who meet specific academic, residency, enrollment, financial need, and community service requirements. You must submit six required items by March 15, 2024, including an application form, official transcript, two recommendation letters, a personal statement, your FAFSA Student Aid Report, and a community service verification form. The committee begins reviewing applications on March 16, may interview finalists in early April, and will notify winners by May 1. If awarded, the scholarship renews for up to four semesters if you maintain a 3.25 GPA and complete 25 service hours per semester.',
  whyItMatters: 'Missing the March 15 deadline or any required document means your application will not be reviewed. The requirements are specific (GPA thresholds, service hours, sealed transcripts) and leave little room for error. Understanding exactly what is needed and when helps you gather materials early and avoid disqualification.',
  immediateActions: [
    {
      id: 'action-1',
      text: 'Complete the Scholarship Application Form on the MCC portal',
      evidence: [{ blockId: 'page-3', quote: 'Completed Scholarship Application Form (available on the MCC portal)' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      priority: 'high',
      details: 'This is the first required item. Access it through the Meridian Community College student portal.',
      dependsOn: [],
      dueDateId: 'date-1',
    },
    {
      id: 'action-2',
      text: 'Request official transcripts to be sent directly to MCC',
      evidence: [{ blockId: 'page-3', quote: 'Official high school or college transcript (must be sealed or sent electronically from the institution)' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      priority: 'high',
      details: 'Transcripts must be sealed or sent electronically from your school. Allow time for processing.',
      dependsOn: [],
      dueDateId: 'date-1',
    },
    {
      id: 'action-3',
      text: 'Ask two recommenders (one academic, one community service supervisor) for letters',
      evidence: [{ blockId: 'page-3', quote: 'Two letters of recommendation — one academic, one from a community service supervisor' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      priority: 'high',
      details: 'Give recommenders at least 2-3 weeks notice. Provide them with your resume and the scholarship details.',
      dependsOn: [],
      dueDateId: 'date-1',
    },
  ],
  checklist: [
    {
      id: 'task-1',
      text: 'Complete the Scholarship Application Form on the MCC portal',
      evidence: [{ blockId: 'page-3', quote: 'Completed Scholarship Application Form (available on the MCC portal)' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      priority: 'high',
      details: 'First required item. Access through the Meridian Community College student portal.',
      dependsOn: [],
      dueDateId: 'date-1',
    },
    {
      id: 'task-2',
      text: 'Obtain official transcript (sealed or electronic from institution)',
      evidence: [{ blockId: 'page-3', quote: 'Official high school or college transcript (must be sealed or sent electronically from the institution)' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      priority: 'high',
      details: 'Request from your school registrar. Allow 1-2 weeks for processing.',
      dependsOn: [],
      dueDateId: 'date-1',
    },
    {
      id: 'task-3',
      text: 'Secure academic letter of recommendation',
      evidence: [{ blockId: 'page-3', quote: 'Two letters of recommendation — one academic, one from a community service supervisor' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      priority: 'high',
      details: 'Ask a teacher, professor, or academic advisor who knows your work well.',
      dependsOn: [],
      dueDateId: 'date-1',
    },
    {
      id: 'task-4',
      text: 'Secure community service supervisor letter of recommendation',
      evidence: [{ blockId: 'page-3', quote: 'Two letters of recommendation — one academic, one from a community service supervisor' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      priority: 'high',
      details: 'Ask the person who supervised your community service hours.',
      dependsOn: [],
      dueDateId: 'date-1',
    },
    {
      id: 'task-5',
      text: 'Write personal statement (500-750 words on educational goals and community impact)',
      evidence: [{ blockId: 'page-3', quote: 'Personal statement (500-750 words) describing your educational goals and community impact' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      priority: 'high',
      details: 'Draft, revise, and proofread. Stay within the word count.',
      dependsOn: [],
      dueDateId: 'date-1',
    },
    {
      id: 'task-6',
      text: 'Ensure 2024-2025 FAFSA is on file with MCC and obtain SAR',
      evidence: [{ blockId: 'page-3', quote: 'FAFSA Student Aid Report (SAR) — the 2024-2025 FAFSA must be on file with MCC' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      priority: 'high',
      details: 'If you have not filed the 2024-2025 FAFSA, do so immediately at fafsa.gov. MCC must receive it.',
      dependsOn: [],
      dueDateId: 'date-1',
    },
    {
      id: 'task-7',
      text: 'Complete Community Service Verification Form with supervisor signature(s)',
      evidence: [{ blockId: 'page-3', quote: 'Community Service Verification Form signed by your supervisor(s)' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      priority: 'high',
      details: 'Document your 50+ hours of service within the past 24 months. Get supervisor signatures.',
      dependsOn: [],
      dueDateId: 'date-1',
    },
    {
      id: 'task-8',
      text: 'Submit all materials by March 15, 2024',
      evidence: [{ blockId: 'page-4', quote: 'All materials must be received by the Office of Financial Aid no later than March 15, 2024' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 4', page: 4 },
      ],
      priority: 'high',
      details: 'Deadline is absolute — "Late submissions are not accepted under any circumstances."',
      dependsOn: ['task-1', 'task-2', 'task-3', 'task-4', 'task-5', 'task-6', 'task-7'],
      dueDateId: 'date-1',
    },
    {
      id: 'task-9',
      text: 'Monitor email for finalist interview notification (week of April 8-12)',
      evidence: [{ blockId: 'page-4', quote: 'Finalists may be contacted for a brief interview during the week of April 8-12, 2024' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 4', page: 4 },
      ],
      priority: 'normal',
      details: 'If selected as a finalist, you will be contacted for an interview. Check email regularly.',
      dependsOn: ['task-8'],
      dueDateId: 'date-2',
    },
    {
      id: 'task-10',
      text: 'Watch for award notification by May 1, 2024',
      evidence: [{ blockId: 'page-4', quote: 'Award notifications will be sent by email no later than May 1, 2024' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 4', page: 4 },
      ],
      priority: 'normal',
      details: 'Results will be emailed. If awarded, follow instructions for acceptance.',
      dependsOn: ['task-8'],
      dueDateId: 'date-3',
    },
  ],
  dates: [
    {
      id: 'date-1',
      label: 'Application Deadline',
      originalPhrase: 'March 15, 2024',
      normalizedDate: '2024-03-15',
      dateType: 'deadline',
      needsConfirmation: false,
      explanation: 'Hard deadline — all materials must be received by this date.',
      evidence: [{ blockId: 'page-4', quote: 'All materials must be received by the Office of Financial Aid no later than March 15, 2024' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 4', page: 4 },
      ],
      text: 'Application deadline: March 15, 2024',
    },
    {
      id: 'date-2',
      label: 'Finalist Interview Period',
      originalPhrase: 'week of April 8-12, 2024',
      normalizedDate: '2024-04-08',
      dateType: 'event',
      needsConfirmation: false,
      explanation: 'Finalists may be contacted for interviews during this week.',
      evidence: [{ blockId: 'page-4', quote: 'Finalists may be contacted for a brief interview during the week of April 8-12, 2024' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 4', page: 4 },
      ],
      text: 'Finalist interviews: week of April 8-12, 2024',
    },
    {
      id: 'date-3',
      label: 'Award Notification',
      originalPhrase: 'no later than May 1, 2024',
      normalizedDate: '2024-05-01',
      dateType: 'event',
      needsConfirmation: false,
      explanation: 'Award decisions will be emailed by this date.',
      evidence: [{ blockId: 'page-4', quote: 'Award notifications will be sent by email no later than May 1, 2024' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 4', page: 4 },
      ],
      text: 'Award notification by May 1, 2024',
    },
    {
      id: 'date-4',
      label: 'Community Service Window',
      originalPhrase: 'within the past 24 months',
      normalizedDate: null,
      dateType: 'other',
      needsConfirmation: true,
      explanation: 'The 50 hours of community service must have been completed within 24 months before applying. The exact start date depends on when you submit your application.',
      evidence: [{ blockId: 'page-2', quote: 'Have completed at least 50 hours of documented community service within the past 24 months' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 2', page: 2 },
      ],
      text: 'Community service must be within 24 months of application',
    },
    {
      id: 'date-5',
      label: 'Renewal Requirements (per semester)',
      originalPhrase: '25 hours of community service per semester',
      normalizedDate: null,
      dateType: 'other',
      needsConfirmation: true,
      explanation: 'If awarded, you must complete 25 service hours each semester to renew. Specific deadlines would be set by the college.',
      evidence: [{ blockId: 'page-5', quote: 'completes 25 hours of community service per semester' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 5', page: 5 },
      ],
      text: 'Renewal requires 25 service hours each semester',
    },
  ],
  requiredItems: [
    {
      id: 'item-1',
      itemName: 'Scholarship Application Form',
      requirementType: 'required',
      explanation: 'Must be completed on the MCC portal.',
      evidence: [{ blockId: 'page-3', quote: 'Completed Scholarship Application Form (available on the MCC portal)' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      text: 'Scholarship Application Form (MCC portal)',
    },
    {
      id: 'item-2',
      itemName: 'Official Transcript',
      requirementType: 'required',
      explanation: 'Must be sealed or sent electronically from the institution. Unofficial copies are not accepted.',
      evidence: [{ blockId: 'page-3', quote: 'Official high school or college transcript (must be sealed or sent electronically from the institution)' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      text: 'Official transcript (sealed or electronic from school)',
    },
    {
      id: 'item-3',
      itemName: 'Academic Letter of Recommendation',
      requirementType: 'required',
      explanation: 'One letter from an academic source (teacher, professor, advisor).',
      evidence: [{ blockId: 'page-3', quote: 'Two letters of recommendation — one academic, one from a community service supervisor' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      text: 'Academic recommendation letter',
    },
    {
      id: 'item-4',
      itemName: 'Community Service Supervisor Letter of Recommendation',
      requirementType: 'required',
      explanation: 'One letter from the person who supervised your community service hours.',
      evidence: [{ blockId: 'page-3', quote: 'Two letters of recommendation — one academic, one from a community service supervisor' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      text: 'Community service supervisor recommendation letter',
    },
    {
      id: 'item-5',
      itemName: 'Personal Statement',
      requirementType: 'required',
      explanation: '500-750 words describing your educational goals and community impact.',
      evidence: [{ blockId: 'page-3', quote: 'Personal statement (500-750 words) describing your educational goals and community impact' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      text: 'Personal statement (500-750 words)',
    },
    {
      id: 'item-6',
      itemName: 'FAFSA Student Aid Report (SAR)',
      requirementType: 'required',
      explanation: 'The 2024-2025 FAFSA must be on file with MCC. The SAR confirms your financial need.',
      evidence: [{ blockId: 'page-3', quote: 'FAFSA Student Aid Report (SAR) — the 2024-2025 FAFSA must be on file with MCC' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      text: 'FAFSA Student Aid Report (2024-2025 FAFSA on file with MCC)',
    },
    {
      id: 'item-7',
      itemName: 'Community Service Verification Form',
      requirementType: 'required',
      explanation: 'Form signed by your supervisor(s) documenting 50+ hours within the past 24 months.',
      evidence: [{ blockId: 'page-3', quote: 'Community Service Verification Form signed by your supervisor(s)' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      text: 'Community Service Verification Form (signed)',
    },
  ],
  terms: [
    {
      term: 'FAFSA',
      explanation: 'Free Application for Federal Student Aid — the form used to determine eligibility for federal financial aid and many scholarships.',
      evidence: [{ blockId: 'page-2', quote: 'Demonstrate financial need as determined by the FAFSA' }],
    },
    {
      term: 'SAR (Student Aid Report)',
      explanation: 'A summary of the information you submitted on the FAFSA, including your Expected Family Contribution (EFC).',
      evidence: [{ blockId: 'page-3', quote: 'FAFSA Student Aid Report (SAR) — the 2024-2025 FAFSA must be on file with MCC' }],
    },
    {
      term: 'Merit-based award',
      explanation: 'A scholarship awarded based on academic achievement and other accomplishments, not solely on financial need.',
      evidence: [{ blockId: 'page-1', quote: 'This merit-based award provides up to $5,000 per academic year for eligible students who demonstrate academic excellence' }],
    },
    {
      term: 'Cumulative GPA',
      explanation: 'Your overall grade point average across all completed courses, typically on a 4.0 scale.',
      evidence: [{ blockId: 'page-2', quote: 'Have a minimum cumulative GPA of 3.5 on a 4.0 scale' }],
    },
    {
      term: 'Renewable',
      explanation: 'The scholarship continues for multiple terms if you meet ongoing requirements (GPA, service hours).',
      evidence: [{ blockId: 'page-5', quote: 'The award is renewable for up to four semesters provided the recipient maintains a 3.25 GPA' }],
    },
  ],
  questionsToAsk: [
    {
      question: 'Can the Community Service Verification Form be submitted electronically, or must it be a physical signature?',
      reason: 'The document says "signed by your supervisor(s)" but does not specify whether electronic signatures are accepted.',
      evidence: [{ blockId: 'page-3', quote: 'Community Service Verification Form signed by your supervisor(s)' }],
    },
    {
      question: 'Is the March 15 deadline a "received by" or "postmarked by" deadline?',
      reason: 'The document says "received by the Office of Financial Aid no later than March 15" which implies receipt, not postmark. Confirming ensures you mail early enough.',
      evidence: [{ blockId: 'page-4', quote: 'All materials must be received by the Office of Financial Aid no later than March 15, 2024' }],
    },
    {
      question: 'What specific GPA scale is used if my school uses a weighted scale (e.g., 5.0 for AP classes)?',
      reason: 'The requirement states "3.5 on a 4.0 scale" but does not address weighted GPAs.',
      evidence: [{ blockId: 'page-2', quote: 'Have a minimum cumulative GPA of 3.5 on a 4.0 scale' }],
    },
    {
      question: 'Are summer semesters included in the "four semesters" renewal limit?',
      reason: 'The document says "up to four semesters" but does not clarify if summer terms count.',
      evidence: [{ blockId: 'page-5', quote: 'The award is renewable for up to four semesters' }],
    },
    {
      question: 'Where exactly do I find the Scholarship Application Form on the MCC portal?',
      reason: 'The document references the MCC portal but does not provide a direct link or navigation path.',
      evidence: [{ blockId: 'page-3', quote: 'Completed Scholarship Application Form (available on the MCC portal)' }],
    },
  ],
  uncertainties: [
    {
      id: 'uncertainty-1',
      text: 'The document references a "Community Service Verification Form" but does not include it or link to it.',
      evidence: [{ blockId: 'page-3', quote: 'Community Service Verification Form signed by your supervisor(s)' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 3', page: 3 },
      ],
      whyItMatters: 'You cannot complete this required item without obtaining the form. It may be on the MCC portal or need to be requested from the Financial Aid Office.',
      suggestedQuestion: 'Where can I access the Community Service Verification Form?',
    },
    {
      id: 'uncertainty-2',
      text: 'The document states "up to $5,000 per academic year" but does not explain what determines the exact amount awarded.',
      evidence: [{ blockId: 'page-1', quote: 'This merit-based award provides up to $5,000 per academic year' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 1', page: 1 },
      ],
      whyItMatters: 'The actual award amount may be less than $5,000 depending on factors not described in this document.',
      suggestedQuestion: 'What factors determine the exact scholarship amount awarded?',
    },
    {
      id: 'uncertainty-3',
      text: 'The document mentions an interview for finalists but does not describe the format, duration, or preparation needed.',
      evidence: [{ blockId: 'page-4', quote: 'Finalists may be contacted for a brief interview during the week of April 8-12, 2024' }],
      evidenceStatus: [
        { verified: true, sourceLabel: 'Page 4', page: 4 },
      ],
      whyItMatters: 'If you become a finalist, you will want to prepare appropriately. The lack of details means you should ask.',
      suggestedQuestion: 'What is the format and focus of the finalist interview?',
    },
  ],
  messageDraft: {
    subject: 'Questions about Meridian Founders Scholarship Application',
    body: `Dear Meridian Community College Financial Aid Office,

I am preparing my application for the Meridian Founders Scholarship and have a few questions to ensure my submission is complete:

1. Can the Community Service Verification Form be submitted with electronic signatures, or are physical signatures required?

2. Is the March 15 deadline based on the date materials are received by your office, or the postmark date?

3. Where can I access the Community Service Verification Form? I do not see it linked in the application instructions.

4. What factors determine the exact award amount (up to $5,000)?

Thank you for your help.

Sincerely,
[Your Name]
[Your Student ID or Application Reference, if applicable]`,
  },
};