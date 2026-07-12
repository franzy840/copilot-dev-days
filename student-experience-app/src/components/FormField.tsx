import type { FieldDef } from '../../shared/constants';
import Select from './Select';
import Combobox from './Combobox';

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
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(field.name, e.target.value),
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
        <Select id={field.name} value={value} options={field.options ?? []} onChange={(v) => onChange(field.name, v)} />
      ) : field.type === 'text' && field.suggestions ? (
        <Combobox
          id={field.name}
          value={value}
          suggestions={field.suggestions}
          placeholder="Choose or type your own…"
          onChange={(v) => onChange(field.name, v)}
        />
      ) : (
        <input type={field.type} min={field.min} max={field.max} {...commonProps} />
      )}
    </div>
  );
}
