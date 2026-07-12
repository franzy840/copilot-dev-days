interface Props {
  label: string;
  value: number | string;
  tone?: 'default' | 'danger';
}

export default function StatTile({ label, value, tone = 'default' }: Props) {
  return (
    <div className={tone === 'danger' ? 'stat-tile stat-tile-danger' : 'stat-tile'}>
      <span className="stat-tile-value">{value}</span>
      <span className="stat-tile-label">{label}</span>
    </div>
  );
}
