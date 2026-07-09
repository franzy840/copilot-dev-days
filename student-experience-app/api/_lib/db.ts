import { sql } from '@vercel/postgres';

export interface ContactInfoInput {
  studentName: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  townCity: string;
  postcode: string;
  mobile: string;
  email: string;
  nokName: string;
  nokRelationship: string;
  nokWorkPhone?: string;
  nokHomePhone?: string;
}

export async function insertContactInfo(row: ContactInfoInput) {
  await sql`
    INSERT INTO contact_info (
      student_name, first_name, last_name, address_line1, address_line2,
      town_city, postcode, mobile, email, nok_name, nok_relationship,
      nok_work_phone, nok_home_phone
    ) VALUES (
      ${row.studentName}, ${row.firstName}, ${row.lastName}, ${row.addressLine1}, ${row.addressLine2 ?? null},
      ${row.townCity}, ${row.postcode}, ${row.mobile}, ${row.email}, ${row.nokName}, ${row.nokRelationship},
      ${row.nokWorkPhone ?? null}, ${row.nokHomePhone ?? null}
    )
  `;
}

export interface WideningAccessInput {
  studentName: string;
  age?: string;
  gender?: string;
  transIdentification?: string;
  sexualOrientation?: string;
  disabilities?: string;
  ethnicity?: string;
  householdOccupationAt14?: string;
  schoolType11to15?: string;
  freeSchoolMeals?: string;
  parentsAttendedUniversity?: string;
}

export async function insertWideningAccess(row: WideningAccessInput) {
  await sql`
    INSERT INTO widening_access (
      student_name, age, gender, trans_identification, sexual_orientation,
      disabilities, ethnicity, household_occupation_at_14, school_type_11_to_15,
      free_school_meals, parents_attended_university
    ) VALUES (
      ${row.studentName}, ${row.age ?? null}, ${row.gender ?? null}, ${row.transIdentification ?? null}, ${row.sexualOrientation ?? null},
      ${row.disabilities ?? null}, ${row.ethnicity ?? null}, ${row.householdOccupationAt14 ?? null}, ${row.schoolType11to15 ?? null},
      ${row.freeSchoolMeals ?? null}, ${row.parentsAttendedUniversity ?? null}
    )
  `;
}

export interface LocalInductionInput {
  studentName: string;
  supervisorName: string;
  department: string;
  risksNotes?: string;
  esignature: string;
  inductionDate: string;
}

export async function insertLocalInduction(row: LocalInductionInput) {
  await sql`
    INSERT INTO local_induction (
      student_name, supervisor_name, department, risks_notes, esignature, induction_date
    ) VALUES (
      ${row.studentName}, ${row.supervisorName}, ${row.department}, ${row.risksNotes ?? null}, ${row.esignature}, ${row.inductionDate}
    )
  `;
}

export interface QuizInput {
  studentName: string;
  answers: Record<string, number>;
  score: number;
  total: number;
}

export async function insertQuiz(row: QuizInput) {
  await sql`
    INSERT INTO quiz_responses (student_name, answers, score, total)
    VALUES (${row.studentName}, ${JSON.stringify(row.answers)}, ${row.score}, ${row.total})
  `;
}

export interface FeedbackInput {
  studentName?: string;
  dateFrom?: string;
  dateTo?: string;
  hospital?: string;
  team?: string;
  ratings: Record<string, { score: number; comment?: string }>;
  careerInfluence?: string;
  mostUseful?: string;
  suggestions?: string;
  concern?: string;
  careerPathUse?: string;
  memorableMention?: string;
  otherComments?: string;
}

export async function insertFeedback(row: FeedbackInput) {
  await sql`
    INSERT INTO feedback (
      student_name, date_from, date_to, hospital, team, ratings,
      career_influence, most_useful, suggestions, concern, career_path_use,
      memorable_mention, other_comments
    ) VALUES (
      ${row.studentName ?? null}, ${row.dateFrom ?? null}, ${row.dateTo ?? null}, ${row.hospital ?? null}, ${row.team ?? null}, ${JSON.stringify(row.ratings)},
      ${row.careerInfluence ?? null}, ${row.mostUseful ?? null}, ${row.suggestions ?? null}, ${row.concern ?? null}, ${row.careerPathUse ?? null},
      ${row.memorableMention ?? null}, ${row.otherComments ?? null}
    )
  `;
}

export async function fetchAllTables() {
  const [contactInfo, wideningAccess, localInduction, quiz, feedback] = await Promise.all([
    sql`SELECT * FROM contact_info ORDER BY id DESC`,
    sql`SELECT * FROM widening_access ORDER BY id DESC`,
    sql`SELECT * FROM local_induction ORDER BY id DESC`,
    sql`SELECT * FROM quiz_responses ORDER BY id DESC`,
    sql`SELECT * FROM feedback ORDER BY id DESC`,
  ]);
  return {
    contactInfo: contactInfo.rows,
    wideningAccess: wideningAccess.rows,
    localInduction: localInduction.rows,
    quiz: quiz.rows,
    feedback: feedback.rows,
  };
}
