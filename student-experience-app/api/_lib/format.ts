import { QUIZ_QUESTIONS, FEEDBACK_STATEMENTS } from '../../shared/constants.js';

const LIKERT_LABELS = ['Strongly Disagree', 'Slightly Disagree', 'Slightly Agree', 'Strongly Agree'];

/** Turns {q1: 2, q2: 0, ...} into the actual question + chosen answer text, one block per question. */
export function formatQuizAnswers(answers: Record<string, number>): string {
  return QUIZ_QUESTIONS.map((q, i) => {
    const chosenIndex = answers?.[q.id];
    const chosenText = typeof chosenIndex === 'number' ? q.options[chosenIndex] : '(no answer)';
    const mark = typeof chosenIndex !== 'number' ? '' : chosenIndex === q.correctIndex ? ' [correct]' : ' [incorrect]';
    return `${i + 1}. ${q.question}\n   -> ${chosenText}${mark}`;
  }).join('\n\n');
}

/** Turns {q1: {score, comment}, ...} into the actual statement + rating + comment, one block per statement. */
export function formatFeedbackRatings(ratings: Record<string, { score?: number; comment?: string }>): string {
  return FEEDBACK_STATEMENTS.map((s, i) => {
    const entry = ratings?.[s.id];
    const scoreText =
      typeof entry?.score === 'number' ? `${entry.score}/4 (${LIKERT_LABELS[entry.score - 1] ?? 'unknown'})` : '(no answer)';
    const comment = entry?.comment ? `\n   Comment: ${entry.comment}` : '';
    return `${i + 1}. ${s.text}\n   Rating: ${scoreText}${comment}`;
  }).join('\n\n');
}
