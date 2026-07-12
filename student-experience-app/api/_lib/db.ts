import { sql } from '@vercel/postgres';

export interface ContactInfoInput {
  userId: number;
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
      user_id, student_name, first_name, last_name, address_line1, address_line2,
      town_city, postcode, mobile, email, nok_name, nok_relationship,
      nok_work_phone, nok_home_phone
    ) VALUES (
      ${row.userId}, ${row.studentName}, ${row.firstName}, ${row.lastName}, ${row.addressLine1}, ${row.addressLine2 ?? null},
      ${row.townCity}, ${row.postcode}, ${row.mobile}, ${row.email}, ${row.nokName}, ${row.nokRelationship},
      ${row.nokWorkPhone ?? null}, ${row.nokHomePhone ?? null}
    )
  `;
}

export interface WideningAccessInput {
  userId: number;
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
      user_id, student_name, age, gender, trans_identification, sexual_orientation,
      disabilities, ethnicity, household_occupation_at_14, school_type_11_to_15,
      free_school_meals, parents_attended_university
    ) VALUES (
      ${row.userId}, ${row.studentName}, ${row.age ?? null}, ${row.gender ?? null}, ${row.transIdentification ?? null}, ${row.sexualOrientation ?? null},
      ${row.disabilities ?? null}, ${row.ethnicity ?? null}, ${row.householdOccupationAt14 ?? null}, ${row.schoolType11to15 ?? null},
      ${row.freeSchoolMeals ?? null}, ${row.parentsAttendedUniversity ?? null}
    )
  `;
}

export interface LocalInductionInput {
  userId: number;
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
      user_id, student_name, supervisor_name, department, risks_notes, esignature, induction_date
    ) VALUES (
      ${row.userId}, ${row.studentName}, ${row.supervisorName}, ${row.department}, ${row.risksNotes ?? null}, ${row.esignature}, ${row.inductionDate}
    )
  `;
}

export interface QuizInput {
  userId: number;
  studentName: string;
  answers: Record<string, number>;
  score: number;
  total: number;
}

export async function insertQuiz(row: QuizInput) {
  await sql`
    INSERT INTO quiz_responses (user_id, student_name, answers, score, total)
    VALUES (${row.userId}, ${row.studentName}, ${JSON.stringify(row.answers)}, ${row.score}, ${row.total})
  `;
}

export interface FeedbackInput {
  userId: number;
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
      user_id, student_name, date_from, date_to, hospital, team, ratings,
      career_influence, most_useful, suggestions, concern, career_path_use,
      memorable_mention, other_comments
    ) VALUES (
      ${row.userId}, ${row.studentName ?? null}, ${row.dateFrom ?? null}, ${row.dateTo ?? null}, ${row.hospital ?? null}, ${row.team ?? null}, ${JSON.stringify(row.ratings)},
      ${row.careerInfluence ?? null}, ${row.mostUseful ?? null}, ${row.suggestions ?? null}, ${row.concern ?? null}, ${row.careerPathUse ?? null},
      ${row.memorableMention ?? null}, ${row.otherComments ?? null}
    )
  `;
}

// ---- Users & auth ----

export interface DbUser {
  id: number;
  name: string;
  email: string;
  password_hash: string | null;
  created_at: string;
}

export async function findUserByEmail(email: string): Promise<DbUser | undefined> {
  const { rows } = await sql<DbUser>`SELECT * FROM users WHERE email = ${email.toLowerCase()}`;
  return rows[0];
}

export async function findUserById(id: number): Promise<DbUser | undefined> {
  const { rows } = await sql<DbUser>`SELECT * FROM users WHERE id = ${id}`;
  return rows[0];
}

export async function createUser(name: string, email: string, passwordHash: string): Promise<DbUser> {
  const { rows } = await sql<DbUser>`
    INSERT INTO users (name, email, password_hash) VALUES (${name}, ${email.toLowerCase()}, ${passwordHash})
    RETURNING *
  `;
  return rows[0];
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${userId}`;
}

export async function hasCompletedDay1(userId: number): Promise<boolean> {
  const { rows } = await sql`SELECT 1 FROM quiz_responses WHERE user_id = ${userId} LIMIT 1`;
  return rows.length > 0;
}

export async function hasCompletedFeedback(userId: number): Promise<boolean> {
  const { rows } = await sql`SELECT 1 FROM feedback WHERE user_id = ${userId} LIMIT 1`;
  return rows.length > 0;
}

// ---- Admin ----

export async function listUsersForAdmin() {
  const { rows } = await sql`
    SELECT
      u.id, u.name, u.email, u.created_at,
      EXISTS (SELECT 1 FROM quiz_responses q WHERE q.user_id = u.id) AS day1_completed,
      EXISTS (SELECT 1 FROM feedback f WHERE f.user_id = u.id) AS feedback_completed
    FROM users u
    ORDER BY u.created_at DESC
  `;
  return rows;
}

const ADMIN_TABLES = {
  contactInfo: 'contact_info',
  wideningAccess: 'widening_access',
  localInduction: 'local_induction',
  quiz: 'quiz_responses',
  feedback: 'feedback',
} as const;

export type AdminTableKey = keyof typeof ADMIN_TABLES;

export function isAdminTableKey(value: string): value is AdminTableKey {
  return value in ADMIN_TABLES;
}

/** Table name is validated against the fixed ADMIN_TABLES map above, never interpolated from raw input. */
export async function fetchTableForAdmin(key: AdminTableKey) {
  const table = ADMIN_TABLES[key];
  const { rows } = await sql.query(
    `SELECT t.*, u.email AS account_email FROM ${table} t LEFT JOIN users u ON u.id = t.user_id ORDER BY t.id DESC`,
  );
  return rows;
}

export async function fetchAnalytics() {
  const [userCounts, quizScores, feedbackRatings, wideningAge, wideningCategorical, day1ByDate] = await Promise.all([
    sql`
      SELECT
        (SELECT count(*) FROM users) AS total_users,
        (SELECT count(DISTINCT user_id) FROM quiz_responses) AS day1_completed,
        (SELECT count(DISTINCT user_id) FROM feedback) AS feedback_completed
    `,
    sql`SELECT score, count(*) AS count FROM quiz_responses GROUP BY score ORDER BY score`,
    sql`SELECT ratings FROM feedback`,
    sql`SELECT age FROM widening_access WHERE age IS NOT NULL AND age <> ''`,
    sql`SELECT gender, ethnicity, disabilities FROM widening_access`,
    sql`SELECT submitted_at::date AS day, count(*) AS count FROM quiz_responses GROUP BY day ORDER BY day`,
  ]);

  return {
    totals: userCounts.rows[0],
    quizScores: quizScores.rows,
    feedbackRatingsRaw: feedbackRatings.rows,
    wideningAges: wideningAge.rows.map((r) => Number(r.age)).filter((n) => !Number.isNaN(n)),
    wideningCategorical: wideningCategorical.rows,
    day1ByDate: day1ByDate.rows,
  };
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
