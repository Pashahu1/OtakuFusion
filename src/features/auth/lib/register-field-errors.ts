export type RegisterFieldKey = 'username' | 'email' | 'password' | 'confirm';

export type InvalidFields = Partial<Record<RegisterFieldKey, true>>;

const REGISTER_FIELD_KEYS: RegisterFieldKey[] = [
  'username',
  'email',
  'password',
  'confirm',
];

export function errorsRecordToInvalidFlags(
  fieldErrors: Record<string, string[] | undefined>,
): InvalidFields {
  const flags: InvalidFields = {};
  for (const key of REGISTER_FIELD_KEYS) {
    if (fieldErrors[key]?.length) flags[key] = true;
  }
  return flags;
}
