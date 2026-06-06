/**
 * Prepends the app base path to an API URL.
 * Required because browser fetch() doesn't auto-apply Next.js basePath.
 *
 * Usage:  fetch(apiUrl("/api/departments"))
 */
export function apiUrl(path: string): string {
  const nextData =
    typeof window === "undefined"
      ? undefined
      : (window as Window & { __NEXT_DATA__?: { basePath?: string } }).__NEXT_DATA__;
  const base =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_BASE_PATH ?? ""
      : nextData?.basePath ?? process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path}`;
}
