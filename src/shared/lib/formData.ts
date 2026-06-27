export interface BuildFormDataOptions {
  /**
   * Keys whose (array/object) value must be serialized with `JSON.stringify`
   * into a single string field. This is the `POST /Products` quirk (TRD §7):
   * `Options` and `Variants` are typed as plain strings server-side.
   */
  stringifyKeys?: readonly string[];
}

/**
 * Builds `FormData` from a typed object for the multipart endpoints (TRD §7).
 *
 * Rules:
 * - `undefined` / `null` values are skipped.
 * - keys in `stringifyKeys` are `JSON.stringify`'d into one string field.
 * - `File` / `Blob` values are appended as binary parts (e.g. `Image`).
 * - arrays become repeated fields (e.g. `TagIds`, multiple `Images`); array
 *   items that are files are appended as binary parts.
 * - booleans are normalized to `'true'` / `'false'`.
 * - everything else is coerced with `String(...)`.
 */
export function buildFormData(
  data: Record<string, unknown>,
  options: BuildFormDataOptions = {},
): FormData {
  const { stringifyKeys = [] } = options;
  const formData = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (stringifyKeys.includes(key)) {
      formData.append(key, JSON.stringify(value));
      continue;
    }

    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) {
          continue;
        }
        if (item instanceof File || item instanceof Blob) {
          formData.append(key, item);
        } else if (typeof item === 'boolean') {
          formData.append(key, item ? 'true' : 'false');
        } else {
          formData.append(key, String(item));
        }
      }
      continue;
    }

    if (typeof value === 'boolean') {
      formData.append(key, value ? 'true' : 'false');
      continue;
    }

    formData.append(key, String(value));
  }

  return formData;
}
