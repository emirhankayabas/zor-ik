import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  UserCircle,
  CalendarDays,
  Clock,
  Wallet,
  Building2,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  calculateSeniorityQuota,
} from "@/lib/leave-engine";
import {
  getStatusStyle,
  getStatusLabel,
  getStatusIcon,
  formatDateLocale,
} from "@/lib/status-helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Profilim" };

const money = (n: number) =>
  `₺${(n || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;

export default async function ProfilePage() {
  const session = await getServerAuthSession();
  if (!session) return null;

  const t = await getTranslations("profile");
  const tCommon = await getTranslations("common");
  const tRoles = await getTranslations("roles");
  const tStatus = await getTranslations("status");
  const tWeekdays = await getTranslations("weekdays");
  const tPayroll = await getTranslations("payroll");
  const locale = await getLocale();

  const employee = await prisma.employee.findFirst({
    where: { userId: session.user.id, companyId: session.user.companyId },
    include: {
      user: { select: { name: true, email: true, role: true } },
      department: { select: { name: true } },
      shift: true,
      salary: true,
      payrolls: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 6 },
      leaveRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { leaveType: { select: { name: true } } },
      },
    },
  });

  if (!employee) {
    return (
      <div className="flex flex-col gap-4 max-w-3xl mx-auto px-4 pb-12">
        <CardTitle className="text-xl font-medium">{t("title")}</CardTitle>
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            {t("noEmployeeRecord")}
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleLabel =
    employee.user.role === "COMPANY_ADMIN"
      ? tRoles("admin")
      : employee.user.role === "MANAGER"
        ? tRoles("manager")
        : employee.user.role === "SUPER_ADMIN"
          ? "Süper Admin"
          : tRoles("employee");

  const seniorityQuota = calculateSeniorityQuota(employee.hireDate);

  const weekdayLabels: Record<number, string> = {
    1: tWeekdays("mon"),
    2: tWeekdays("tue"),
    3: tWeekdays("wed"),
    4: tWeekdays("thu"),
    5: tWeekdays("fri"),
    6: tWeekdays("sat"),
    0: tWeekdays("sun"),
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto px-4 pb-12">
      <div>
        <CardTitle className="text-xl mb-0.5 font-medium">{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </div>

      {/* Kişisel bilgiler */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <UserCircle className="size-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{employee.user.name}</CardTitle>
              <CardDescription>{employee.user.email}</CardDescription>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {roleLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <Info icon={<Building2 className="size-4" />} label={tCommon("department")} value={employee.department?.name || "—"} />
          <Info icon={<Briefcase className="size-4" />} label={tCommon("position")} value={employee.position || "—"} />
          <Info icon={<CalendarDays className="size-4" />} label={t("hireDate")} value={formatDateLocale(employee.hireDate.toISOString(), locale)} />
          <Info icon={<UserCircle className="size-4" />} label={t("role")} value={roleLabel} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* İzin bakiyesi */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" /> {t("leaveBalance")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <div className="flex items-end justify-between">
              <span className="text-sm text-muted-foreground">{t("remainingDays")}</span>
              <span className="text-3xl font-black text-primary">
                {employee.totalLeftLeaveDays}
                <span className="text-sm font-medium text-muted-foreground ml-1">
                  {t("days")}
                </span>
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("annualQuota")}</span>
              <span className="font-medium">{employee.annualLeaveQuota} {t("days")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("seniorityQuota")}</span>
              <span className="font-medium">{seniorityQuota} {t("days")}</span>
            </div>
          </CardContent>
        </Card>

        {/* Vardiya & çalışma */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="size-4 text-primary" /> {t("shiftInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("shift")}</span>
              <span className="font-medium">
                {employee.shift
                  ? `${employee.shift.name} (${employee.shift.startTime}-${employee.shift.endTime})`
                  : t("noShift")}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t("workingDays")}</p>
              <div className="flex flex-wrap gap-1.5">
                {employee.workingDays.map((d) => (
                  <Badge key={d} variant="outline" className="text-[11px]">
                    {weekdayLabels[d] ?? d}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Son bordrolar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="size-4 text-primary" /> {t("recentPayslips")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {employee.payrolls.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{t("noPayslips")}</p>
          ) : (
            <div className="divide-y">
              {employee.payrolls.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/payroll/${p.id}`}
                  className="flex items-center justify-between py-2.5 group"
                >
                  <span className="text-sm font-medium group-hover:text-primary">
                    {tPayroll(`months.${p.month}`)} {p.year}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-sm font-bold">{money(p.netSalary)}</span>
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Son izin talepleri */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" /> {t("recentLeaves")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {employee.leaveRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{t("noLeaves")}</p>
          ) : (
            <div className="divide-y">
              {employee.leaveRequests.map((lr) => (
                <Link
                  key={lr.id}
                  href={`/dashboard/leaves/${lr.id}`}
                  className="flex items-center justify-between py-2.5 group gap-3"
                >
                  <span className="min-w-0">
                    <span className="text-sm font-medium group-hover:text-primary block truncate">
                      {lr.leaveType.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDateLocale(lr.startDate.toISOString(), locale)} —{" "}
                      {formatDateLocale(lr.endDate.toISOString(), locale)}
                    </span>
                  </span>
                  <Badge className={getStatusStyle(lr.status)}>
                    {getStatusIcon(lr.status)}
                    {getStatusLabel(lr.status, tStatus)}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
