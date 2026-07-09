interface Props {
  index: number;
  text: string;
  score?: number;
  comment: string;
  onScore: (score: number) => void;
  onComment: (comment: string) => void;
}

const LABELS = ['Strongly Disagree', 'Slightly Disagree', 'Slightly Agree', 'Strongly Agree'];

export default function LikertQuestion({ index, text, score, comment, onScore, onComment }: Props) {
  return (
    <div className="field">
      <label>
        {index}. {text} *
      </label>
      <div className="scale-group">
        {LABELS.map((label, i) => {
          const value = i + 1;
          return (
            <label key={value}>
              <input type="radio" name={`likert-${index}`} checked={score === value} onChange={() => onScore(value)} required />
              {value} — {label}
            </label>
          );
        })}
      </div>
      {score !== undefined && score <= 3 && (
        <textarea
          placeholder="If you scored 1-3, why did you feel this way? (optional)"
          value={comment}
          onChange={(e) => onComment(e.target.value)}
        />
      )}
    </div>
  );
}
