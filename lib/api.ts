/**
 * Prepends the app base path to an API URL.
 * Required because browser fetch() doesn't auto-apply Next.js basePath.
 *
 * Usage:  fetch(apiUrl("/api/departments"))
 */
export function apiUrl(path: string): string {
  const base =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_BASE_PATH ?? ""
      : (window as any).__NEXT_DATA__?.basePath ?? process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path}`;
}
