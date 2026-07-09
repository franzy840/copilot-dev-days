import type { FieldDef } from '../../shared/constants';

interface Props {
  field: FieldDef;
  value: string;
  onChange: (name: string, value: string) => void;
}

export default function FormField({ field, value, onChange }: Props) {
  const commonProps = {
    id: field.name,
    name: field.name,
    required: field.required,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(field.name, e.target.value),
  };

  return (
    <div className="field">
      <label htmlFor={field.name}>
        {field.label}
        {field.required ? ' *' : ''}
      </label>
      {field.helpText && <div className="field-help">{field.helpText}</div>}
      {field.type === 'textarea' ? (
        <textarea {...commonProps} />
      ) : field.type === 'select' ? (
        <select {...commonProps}>
          <option value="">Select…</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input type={field.type} {...commonProps} />
      )}
    </div>
  );
}
