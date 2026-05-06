/**
 * Deep-clone to plain JSON data so Server Components can pass props to Client Components
 * without Flight/RSC deserialization errors (non-enumerable fields, driver-specific objects, etc.).
 */
export function toPlainJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
