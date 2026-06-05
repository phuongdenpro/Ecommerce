/** Read a property supporting both camelCase and PascalCase API payloads. */
export function pick<T>(obj: Record<string, unknown>, camel: string, pascal: string): T | undefined {
  const v = obj[camel] ?? obj[pascal];
  return v as T | undefined;
}

export function pickArray<T>(obj: Record<string, unknown>, camel: string, pascal: string): T[] {
  const v = pick<T[]>(obj, camel, pascal);
  return Array.isArray(v) ? v : [];
}

export function pickNumber(obj: Record<string, unknown>, camel: string, pascal: string, fallback = 0): number {
  const v = pick<number>(obj, camel, pascal);
  return typeof v === "number" ? v : fallback;
}
