"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const BREADCRUMB_KEYS: Record<string, string> = {
  dashboard: "dashboard",
  employees: "employees",
  departments: "departments",
  leaves: "leaves",
  attendance: "attendance",
  payroll: "payroll",
  settings: "settings",
  hr: "hr",
  approvals: "approvals",
  "leave-requests": "leaveRequests",
  "attendance-requests": "attendanceRequests",
  new: "new",
  edit: "edit",
  members: "members",
  pdks: "pdks",
  calendar: "calendar",
  shifts: "shifts",
  permissions: "permissions",
  "company-settings": "companySettings",
};

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const t = useTranslations("breadcrumb");

  // Split path and filter empty segments
  const segments = pathname.split("/").filter(Boolean);

  // Remove "dashboard" prefix for display but keep it in the href
  // e.g. /dashboard/employees/new → ["dashboard", "employees", "new"]
  if (segments.length === 0) return null;

  // Build breadcrumb items
  const items: { label: string; href: string; isLast: boolean }[] = [];

  // Always show dashboard as root
  items.push({
    label: t("dashboard"),
    href: "/dashboard",
    isLast: segments.length === 1,
  });

  // Build intermediate and final segments
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;

    // Skip UUID-like segments (cuid/uuid) — they are dynamic params
    const isId = /^[a-z0-9]{20,}$/i.test(segment) || /^[0-9a-f-]{36}$/i.test(segment);

    if (isId) continue;

    const key = BREADCRUMB_KEYS[segment];
    const label = key ? t(key) : segment;
    items.push({ label, href, isLast });
  }

  // If only dashboard, show a default
  if (items.length === 1) {
    items[0].isLast = true;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, idx) => (
          <React.Fragment key={item.href}>
            {idx > 0 && (
              <BreadcrumbSeparator className={idx === 1 ? "hidden md:block" : ""}>
                <ChevronRight className="size-3 text-muted-foreground/50" />
              </BreadcrumbSeparator>
            )}
            <BreadcrumbItem className={idx === 0 ? "hidden md:block" : ""}>
              {item.isLast ? (
                <BreadcrumbPage className="text-xs font-bold text-primary">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={item.href}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
