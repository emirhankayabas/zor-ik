import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import {
  UserCircle,
  Building2,
  Briefcase,
  CalendarDays,
  ArrowLeft,
  Pencil,
} from "lucide-react";
import { getServerAuthSession } from "@/lib/auth";
import { canManageCompany } from "@/lib/access";
import prisma from "@/lib/prisma";
import { pickOzlukData } from "@/lib/validations/employee";
import { formatDateLocale } from "@/lib/status-helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OzlukDisplay } from "@/components/shared/ozluk-display";

export const metadata: Metadata = { title: "Çalışan Detayı" };

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerAuthSession();
  if (!session) redirect("/login");

  // Özlük is sensitive — only company managers (HR/admin/manager) may view it.
  if (!canManageCompany(session.user)) {
    redirect("/dashboard/profile");
  }

  const t = await getTranslations("employees");
  const tCommon = await getTranslations("common");
  const tRoles = await getTranslations("roles");
  const locale = await getLocale();

  const employee = await prisma.employee.findFirst({
    where: { id, companyId: session.user.companyId },
    include: {
      user: { select: { name: true, email: true, role: true, isActive: true } },
      department: { select: { name: true } },
      shift: { select: { name: true, startTime: true, endTime: true } },
    },
  });

  if (!employee) notFound();

  const roleLabel =
    employee.user.role === "COMPANY_ADMIN"
      ? tRoles("admin")
      : employee.user.role === "MANAGER"
        ? tRoles("manager")
        : employee.user.role === "SUPER_ADMIN"
          ? "Süper Admin"
          : tRoles("employee");

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto px-4 pb-12">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link href="/dashboard/employees">
            <ArrowLeft className="mr-2 size-4" /> {tCommon("back")}
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={`/dashboard/employees/${id}/edit`}>
            <Pencil className="size-4" /> {t("editSelected")}
          </Link>
        </Button>
      </div>

      {/* Özet kart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <UserCircle className="size-6" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg flex items-center gap-2">
                {employee.user.name}
                {!employee.user.isActive && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-destructive/40 text-destructive"
                  >
                    {t("deactivate")}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>{employee.user.email}</CardDescription>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {roleLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 pb-4">
          <Info
            icon={<Building2 className="size-4" />}
            label={tCommon("department")}
            value={employee.department?.name || "—"}
          />
          <Info
            icon={<Briefcase className="size-4" />}
            label={tCommon("position")}
            value={employee.position || "—"}
          />
          <Info
            icon={<CalendarDays className="size-4" />}
            label={t("hireDate")}
            value={formatDateLocale(employee.hireDate.toISOString(), locale)}
          />
          <Info
            icon={<UserCircle className="size-4" />}
            label={t("systemRole")}
            value={roleLabel}
          />
        </CardContent>
      </Card>

      <OzlukDisplay
        data={pickOzlukData(employee)}
        locale={locale}
        hideEmptySections={false}
      />
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon} {label}
      </span>
      <span className="text-sm font-medium truncate">{value}</span>
    </div>
  );
}
