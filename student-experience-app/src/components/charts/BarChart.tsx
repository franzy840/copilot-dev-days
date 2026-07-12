interface Datum {
  label: string;
  value: number;
}

interface Props {
  title: string;
  data: Datum[];
  max?: number;
  valueFormatter?: (value: number) => string;
}

/** Horizontal bar chart, single sequential hue, direct value label at the tip of each bar. */
export default function BarChart({ title, data, max, valueFormatter }: Props) {
  const effectiveMax = max ?? Math.max(1, ...data.map((d) => d.value));
  const format = valueFormatter ?? ((v: number) => String(v));

  return (
    <div className="chart">
      <h3>{title}</h3>
      {data.length === 0 ? (
        <p className="chart-empty">No submissions yet.</p>
      ) : (
        <div className="chart-rows">
          {data.map((d) => (
            <div className="chart-row" key={d.label}>
              <span className="chart-row-label" title={d.label}>
                {d.label}
              </span>
              <div className="chart-row-track">
                <div className="chart-row-fill" style={{ width: `${Math.min(100, (d.value / effectiveMax) * 100)}%` }} />
              </div>
              <span className="chart-row-value">{format(d.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
