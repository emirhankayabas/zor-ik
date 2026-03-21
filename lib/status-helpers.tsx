import { Clock, CheckCircle2, XCircle } from "lucide-react";

export type RequestStatus = "PENDING" | "MANAGER_APPROVED" | "APPROVED" | "REJECTED";

export function getStatusStyle(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none";
    case "MANAGER_APPROVED":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none";
    case "APPROVED":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none";
    case "REJECTED":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-none";
    default:
      return "bg-muted text-muted-foreground border-none";
  }
}

const STATUS_KEYS: Record<string, string> = {
  PENDING: "pending",
  MANAGER_APPROVED: "managerApproved",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export function getStatusLabel(status: string, t?: (key: string) => string): string {
  const key = STATUS_KEYS[status];
  if (key && t) return t(key);
  switch (status) {
    case "PENDING":
      return "Beklemede";
    case "MANAGER_APPROVED":
      return "Yönetici Onayladı";
    case "APPROVED":
      return "Onaylandı";
    case "REJECTED":
      return "Reddedildi";
    default:
      return status;
  }
}

export function getStatusIcon(status: string) {
  switch (status) {
    case "PENDING":
      return <Clock className="size-3 mr-1" />;
    case "MANAGER_APPROVED":
    case "APPROVED":
      return <CheckCircle2 className="size-3 mr-1" />;
    case "REJECTED":
      return <XCircle className="size-3 mr-1" />;
    default:
      return null;
  }
}

export function formatDateLocale(dateStr: string, locale: string = "tr-TR"): string {
  const localeMap: Record<string, string> = { tr: "tr-TR", en: "en-US" };
  return new Date(dateStr).toLocaleDateString(localeMap[locale] || locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTR(dateStr: string): string {
  return formatDateLocale(dateStr, "tr");
}

/**
 * Convert a Date to "YYYY-MM-DD" string using LOCAL timezone (not UTC).
 * Fixes the off-by-one bug where toISOString() shifts the date back in UTC+X timezones.
 */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
