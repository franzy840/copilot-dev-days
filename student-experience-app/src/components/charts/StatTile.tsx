interface Props {
  label: string;
  value: number | string;
}

export default function StatTile({ label, value }: Props) {
  return (
    <div className="stat-tile">
      <span className="stat-tile-value">{value}</span>
      <span className="stat-tile-label">{label}</span>
    </div>
  );
}
