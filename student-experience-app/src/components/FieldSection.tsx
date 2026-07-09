import type { FieldDef } from '../../shared/constants';
import FormField from './FormField';

interface Props {
  fields: FieldDef[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export default function FieldSection({ fields, values, onChange }: Props) {
  return (
    <>
      {fields.map((field) => (
        <FormField key={field.name} field={field} value={values[field.name] ?? ''} onChange={onChange} />
      ))}
    </>
  );
}
