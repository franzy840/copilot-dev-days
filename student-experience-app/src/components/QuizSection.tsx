import { QUIZ_QUESTIONS } from '../../shared/constants';

interface Props {
  answers: Record<string, number>;
  onAnswer: (questionId: string, optionIndex: number) => void;
}

export default function QuizSection({ answers, onAnswer }: Props) {
  return (
    <>
      {QUIZ_QUESTIONS.map((q, i) => (
        <div className="field" key={q.id}>
          <label>
            {i + 1}. {q.question} *
          </label>
          <div className="radio-group">
            {q.options.map((opt, idx) => (
              <label key={idx}>
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === idx}
                  onChange={() => onAnswer(q.id, idx)}
                  required
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
