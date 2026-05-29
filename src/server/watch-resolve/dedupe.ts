const inflightResolve = new Map<string, Promise<Response>>();

export function canonicalResolveKey(reqUrl: URL): string {
  const entries = [...reqUrl.searchParams.entries()].sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const sp = new URLSearchParams(entries);
  return `${reqUrl.pathname}?${sp.toString()}`;
}

export function getOrCreateInflightResolve(
  key: string,
  factory: () => Promise<Response>
): Promise<Response> {
  let pending = inflightResolve.get(key);
  if (!pending) {
    pending = factory().finally(() => inflightResolve.delete(key));
    inflightResolve.set(key, pending);
  }
  return pending;
}
