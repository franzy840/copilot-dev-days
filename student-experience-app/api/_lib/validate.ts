import type { FieldDef } from '../../shared/constants.js';

/** Returns the labels of any required fields missing/blank from `data`. */
export function missingRequiredFields(fields: FieldDef[], data: Record<string, unknown>): string[] {
  const missing: string[] = [];
  for (const field of fields) {
    if (!field.required) continue;
    const value = data[field.name];
    if (typeof value !== 'string' || value.trim().length === 0) {
      missing.push(field.label);
    }
  }
  return missing;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: unknown): boolean {
  return typeof value === 'string' && EMAIL_RE.test(value);
}
