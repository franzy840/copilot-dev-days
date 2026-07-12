// Shared field/question definitions used by both the React forms (src/)
// and the serverless API handlers (api/). Keeping one source of truth
// means the form the student sees and the columns written to the
// database/Excel export can never drift apart.

// Where admin notification emails (submissions, urgent alerts) are sent.
export const ADMIN_EMAIL = 'franzy840@gmail.com';

// Login name for the /admin/login screen. Not an email address - just a
// username, checked against ADMIN_PASSWORD (env var). Separate from
// ADMIN_EMAIL above so the login name doesn't have to be an email.
export const ADMIN_USERNAME = 'hansel';

// ---- Section access control ----
//
// Each key names one of the 5 independently-lockable sections a student
// fills in. A section is only visible/submittable once the admin grants
// it for that specific student (see section_access table).
export const SECTION_KEYS = ['contactInfo', 'wideningAccess', 'localInduction', 'quiz', 'feedback'] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export function isSectionKey(value: string): value is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(value);
}

export const SECTION_LABELS: Record<SectionKey, string> = {
  contactInfo: 'Contact Information',
  wideningAccess: 'Widening Access Participation Survey',
  localInduction: 'Local Induction',
  quiz: 'Induction Quiz',
  feedback: 'Final Day Feedback',
};

// Granted automatically at signup - no admin action needed. Local
// Induction and Final Day Feedback are deliberately left out: they
// require the admin to grant them individually (a student can ask via
// the "Request Access" button once they're locked out of one).
export const DEFAULT_GRANTED_SECTIONS: SectionKey[] = ['contactInfo', 'wideningAccess', 'quiz'];

export type FieldType = 'text' | 'email' | 'tel' | 'date' | 'number' | 'textarea' | 'select';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  helpText?: string;
  /** For 'text' fields: shown as a "choose or type" suggestion list instead of a plain input. */
  suggestions?: string[];
  /** For 'number' fields. */
  min?: number;
  max?: number;
}

export const HOSPITAL_SUGGESTIONS = ['Epsom Hospital', 'St Helier Hospital'];

export const DEPARTMENT_SUGGESTIONS = [
  'Accident & Emergency',
  'Acute Medical Unit',
  'Cardiology',
  'General Surgery',
  'Maternity',
  'Neonatal Unit',
  'Oncology',
  'Orthopaedics',
  'Outpatients',
  'Paediatrics',
  'Pathology',
  'Pharmacy',
  'Physiotherapy',
  'Radiology',
  'Respiratory Medicine',
  'Theatres',
];

// ---- Contact Information (Day 1) ----

export const CONTACT_INFO_FIELDS: FieldDef[] = [
  { name: 'firstName', label: 'First Name', type: 'text', required: true },
  { name: 'lastName', label: 'Last Name', type: 'text', required: true },
  { name: 'addressLine1', label: 'Address Line 1', type: 'text', required: true },
  { name: 'addressLine2', label: 'Address Line 2', type: 'text' },
  { name: 'townCity', label: 'Town / City', type: 'text', required: true },
  { name: 'postcode', label: 'Postcode', type: 'text', required: true },
  { name: 'mobile', label: 'Contact Number (mobile)', type: 'tel', required: true },
  { name: 'email', label: 'Email Address', type: 'email', required: true },
  { name: 'nokName', label: 'Next of Kin - Full Name', type: 'text', required: true },
  { name: 'nokRelationship', label: 'Relationship with the above', type: 'text', required: true },
  { name: 'nokWorkPhone', label: 'Next of Kin Contact Number (work)', type: 'tel' },
  { name: 'nokHomePhone', label: 'Next of Kin Contact Number (home)', type: 'tel' },
];

// ---- Widening Access Participation Survey (Day 1, optional) ----

const PREFER_NOT_TO_SAY = 'Prefer not to say';

export const AGE_BUCKET_LABELS = ['Under 16', '16-18', '19-24', '25-29', '30-39', '40-49', '50-59', '60+'];

export const WIDENING_ACCESS_FIELDS: FieldDef[] = [
  {
    name: 'age',
    label: 'Age',
    type: 'select',
    required: true,
    options: [...AGE_BUCKET_LABELS, PREFER_NOT_TO_SAY],
  },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    options: ['Male', 'Female', 'Non-binary', 'Other', 'Unknown', PREFER_NOT_TO_SAY],
  },
  {
    name: 'transIdentification',
    label: 'Trans Identification',
    type: 'select',
    options: ['Yes', 'No', 'Other', 'Unknown', PREFER_NOT_TO_SAY],
  },
  {
    name: 'sexualOrientation',
    label: 'Sexual Orientation',
    type: 'select',
    options: ['Straight/Heterosexual', 'Gay/Homosexual', 'Gay/Lesbian', 'Bisexual', 'None/Asexual', 'Other', PREFER_NOT_TO_SAY],
  },
  {
    name: 'disabilities',
    label: "Do you have a physical or mental impairment that has a 'substantial' and 'long-term' negative effect on your ability to do normal daily activities?",
    type: 'select',
    options: ['Yes', 'No', 'Other', 'Unknown', PREFER_NOT_TO_SAY],
  },
  {
    name: 'ethnicity',
    label: 'What is your Ethnicity',
    type: 'select',
    options: [
      'Asian/Asian British – Bangladeshi',
      'Asian/Asian British – Indian',
      'Asian/Asian British – Pakistani',
      'Black',
      'Black British African',
      'Chinese',
      'Indian',
      'White British',
      'Mixed/multiple – White and Asian',
      'Mixed/Multiple – White and Black African',
      'Mixed/Multiple – White and Black Caribbean',
      'Any other mixed/multiple ethnic background',
      'Any other white background',
      'Other',
      PREFER_NOT_TO_SAY,
    ],
  },
  {
    name: 'householdOccupationAt14',
    label: 'What is/was the occupation of the main earner in your household when you were 14',
    type: 'select',
    options: [
      'Modern/traditional professional',
      'Clerical and intermediate occupations',
      'Long-term unemployed',
      'Retired',
      'Semi-routine manual and service occupations',
      'Senior, middle or junior managers or administrators',
      'Small business owners',
      'Technical and craft occupations',
      'Other',
      'Unknown',
      PREFER_NOT_TO_SAY,
    ],
  },
  {
    name: 'schoolType11to15',
    label: 'The type of school you attend/attended between the ages of 11 - 15',
    type: 'select',
    options: [
      'Attended school outside of the UK',
      'Independent or fee-paying school',
      'Independent or fee-paying school, receiving means-tested bursary covering 90% or more of the overall cost of attending',
      'State-run or state-funded school',
      'Other',
      'Unknown',
      PREFER_NOT_TO_SAY,
    ],
  },
  {
    name: 'freeSchoolMeals',
    label: 'Have you been eligible for free school meals at any point during school?',
    type: 'select',
    options: ['Yes', 'No', 'Not applicable (finished school before 1980 or went to school overseas)', 'Unknown', PREFER_NOT_TO_SAY],
  },
  {
    name: 'parentsAttendedUniversity',
    label: 'Did either of your parents attend University (before you were 18)?',
    type: 'select',
    options: ['No, neither attended university', 'Yes, one or both parents attended university', 'Unknown', PREFER_NOT_TO_SAY],
  },
];

// ---- Local Induction Form (Day 1) ----

export const LOCAL_INDUCTION_FIELDS: FieldDef[] = [
  { name: 'supervisorName', label: 'Local Supervisor Name', type: 'text', required: true },
  { name: 'department', label: 'Department / Ward', type: 'text', required: true, suggestions: DEPARTMENT_SUGGESTIONS },
  {
    name: 'risksNotes',
    label: 'Department-specific risks explained to you (notes)',
    type: 'textarea',
    helpText: 'Fire evacuation info, assembly points, and any risks specific to this area.',
  },
  { name: 'esignature', label: 'Student e-signature (type your full name)', type: 'text', required: true },
  { name: 'inductionDate', label: 'Date', type: 'date', required: true },
];

// ---- Work Experience Induction Quiz (Day 1) ----

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Where do you need to sign in each day?',
    options: ['With your named team', 'In the Undergraduate Education Centre', 'Both Security and the Undergraduate Education Centre'],
    correctIndex: 2,
  },
  {
    id: 'q2',
    question: 'Which of the following is an appropriate example of attire for work experience at the hospital?',
    options: ['Ironed shirt and trousers', 'Comfortable jeans and trainers', 'Branded sweatshirt and jogging bottoms'],
    correctIndex: 0,
  },
  {
    id: 'q3',
    question: 'You have been ill during the night with an upset stomach and are feeling unwell. What do you need to do?',
    options: [
      'Stay in bed for a few extra hours in the morning and see if you feel better. Come in when you can.',
      'Telephone or leave an email with the undergrad team to let them know you will not be in attendance.',
      'Come to the hospital anyway, the work experience is the most important thing.',
    ],
    correctIndex: 1,
  },
  {
    id: 'q4',
    question: 'What should you always do on entering and leaving a ward or clinical area?',
    options: ['Wipe your feet on the mat', 'Loudly announce to all that you have arrived', 'Use the hand sanitizer provided'],
    correctIndex: 2,
  },
  {
    id: 'q5',
    question: 'You see someone you know as a patient during your work experience. What should you never do?',
    options: [
      'Politely say hello.',
      'Ask them if they mind you being in attendance during their consultation',
      'Go home and tell your friends and family that you have seen them and about the condition they have presented with.',
    ],
    correctIndex: 2,
  },
  {
    id: 'q6',
    question: 'You come across a spillage of liquid on the floor. What should you do?',
    options: [
      'Report it to your supervisor or the nearest member of staff.',
      'Leave it, someone else will find it.',
      'Put some paper towels on it and leave to dry.',
    ],
    correctIndex: 0,
  },
  {
    id: 'q7',
    question: 'You hear alarm bells ringing in the area you are assigned to, but they are intermittent. What does this mean and what should you do?',
    options: [
      'There is a fire, run to the nearest exit.',
      'A fire alarm has been triggered in an area adjacent to where you are. There is no need to evacuate immediately, but remain cautious as the situation may change.',
      "Assume it is only a test, you don't need to do anything, systems are checked all of the time.",
    ],
    correctIndex: 1,
  },
  {
    id: 'q8',
    question: 'A patient is looking uncomfortable in their bed or has asked you to help them move. What should you do?',
    options: [
      'Help the patient',
      'Leave them and do nothing, someone else might be along soon to help',
      'Speak to one of your team; they will have had the relevant training on how to move the patient safely.',
    ],
    correctIndex: 2,
  },
  {
    id: 'q9',
    question: 'You are leaving for the day but will be back tomorrow. What should you do with your ID badge?',
    options: [
      'Take it home and keep it safe. Bring it back in for use the next day.',
      'Leave it in a place where you can easily find it in the morning.',
      'Take it back to security and pick up a new one in the morning.',
    ],
    correctIndex: 2,
  },
  {
    id: 'q10',
    question: 'It is 12:30pm on Friday; your work experience has come to an end. What do you do before you go home?',
    options: [
      'Bring your handbook to the Undergrad Team for review and to collect your certificate, remembering to hand back your ID badge.',
      'Go straight home taking your ID badge with you as a memento.',
      'Stay late and come to the Undergraduate Centre at six o’clock, hoping to find someone to sign your booklet.',
    ],
    correctIndex: 0,
  },
];

// ---- Work Experience Feedback (Final Day) ----

export const FEEDBACK_STATEMENTS: { id: string; text: string }[] = [
  { id: 'q1', text: 'My placement was well organised and I was provided with all the required information beforehand.' },
  { id: 'q2', text: 'The Undergraduate Education Team were welcoming and helpful.' },
  { id: 'q3', text: 'I received a friendly greeting from my assigned team and I was made to feel welcome.' },
  { id: 'q4', text: 'During my placement I felt involved and was included in conversations.' },
  { id: 'q5', text: 'My timetable ran to plan or/ I was informed of timetable changes in advance' },
  { id: 'q6', text: 'The structure of the programme was satisfactory.' },
  { id: 'q7', text: 'I now have a better understanding of the work that is undertaken by the hospital.' },
  { id: 'q8', text: 'I have achieved the learning objectives I had personally hoped to gain from this placement.' },
  { id: 'q9', text: 'When I asked questions about this career path I was given valuable advice' },
  { id: 'q10', text: 'Overall my work experience placement was good and I would recommend it to others.' },
];

export const FEEDBACK_OPEN_FIELDS: FieldDef[] = [
  { name: 'careerInfluence', label: 'Has your placement influenced your choice of career in any way?', type: 'textarea' },
  { name: 'mostUseful', label: 'What was most useful?', type: 'textarea' },
  { name: 'suggestions', label: 'Any suggestions or improvements?', type: 'textarea' },
  {
    name: 'concern',
    label: 'Did you witness anything of concern that you would like to confidentially report?',
    type: 'textarea',
    helpText: 'This is sent straight to the Undergraduate Team admin as an urgent alert.',
  },
  { name: 'careerPathUse', label: 'How will you use what you have learned from any aspect of these sessions to help you advance along your career path?', type: 'textarea' },
  { name: 'memorableMention', label: 'Is there anyone at the hospital that you would like to mention as having given you an especially memorable placement?', type: 'text' },
  { name: 'otherComments', label: 'Any other comments', type: 'textarea' },
];

export const CONCERN_FIELD_NAME = 'concern';
