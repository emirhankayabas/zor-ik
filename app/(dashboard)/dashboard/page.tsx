import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  CalendarDays,
  ArrowDownRight,
  History,
  Flag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { tr, enUS } from "date-fns/locale";
import { formatDateLocale } from "@/lib/status-helpers";
import { canManageCompany } from "@/lib/access";
import { getCompanyStats } from "@/lib/dashboard-stats";
import { HrAnalytics } from "./_components/hr-analytics";

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session) return null;

  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");
  const tStatus = await getTranslations("status");
  const locale = await getLocale();
  const dateLocale = locale === "tr" ? tr : enUS;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      department: {
        include: {
          manager: true,
        },
      },
      leaveRequests: {
        include: {
          leaveType: true,
        },
        orderBy: {
          startDate: "desc",
        },
      },
    },
  });

  const now = new Date();

  // Company-wide analytics for managers/HR/admin.
  const showHrAnalytics = canManageCompany(session.user);
  const companyStats = showHrAnalytics
    ? await getCompanyStats(session.user.companyId)
    : null;

  // Filter approved leaves
  const approvedLeaves =
    employee?.leaveRequests.filter((req) => req.status === "APPROVED") || [];

  // Calculate Used Leaves by Type (using the new actualDays field)
  const annualLeaveUsed = approvedLeaves
    .filter((req) => req.leaveType.name === "Yıllık İzin")
    .reduce((acc, req) => acc + (req.actualDays || 0), 0);

  const otherLeaveUsed = approvedLeaves
    .filter((req) => req.leaveType.name !== "Yıllık İzin")
    .reduce((acc, req) => acc + (req.actualDays || 0), 0);

  // Use real values from database
  const totalAnnualQuota = employee?.annualLeaveQuota || 0;
  const remAnnual = employee?.totalLeftLeaveDays ?? 0;

  // Progress should be based on used vs quota, only if quota > 0
  const annualWorkProgress =
    totalAnnualQuota > 0
      ? Math.min(100, Math.max(0, (annualLeaveUsed / totalAnnualQuota) * 100))
      : 0;

  // Calculate Renewal Date
  let nextRenewalDate = "-";
  if (employee?.hireDate) {
    const hireDate = new Date(employee.hireDate);
    const currentYear = now.getFullYear();
    const renewalThisYear = new Date(hireDate);
    renewalThisYear.setFullYear(currentYear);

    if (renewalThisYear < now) {
      renewalThisYear.setFullYear(currentYear + 1);
    }
    nextRenewalDate = formatDateLocale(renewalThisYear.toISOString(), locale);
  }

  // Upcoming Leaves
  const upcomingLeaves = approvedLeaves
    .filter((req) => req.startDate > now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 3);

  // Recent Requests
  const recentRequests = employee?.leaveRequests.slice(0, 3) || [];

  return (
    <div className="space-y-6 container mx-auto py-8">
      <div>
        <div className="space-y-1">
          <CardTitle className="text-xl">
            {t("welcome", { name: session.user.name || "" })}
          </CardTitle>
          <CardDescription>
            {t("subtitle")}
          </CardDescription>
        </div>
      </div>

      {companyStats && (
        <>
          <HrAnalytics stats={companyStats} locale={locale} />
          <div className="h-px bg-border" />
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Stats */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex items-center gap-x-1">
                <CardTitle>{t("annualLeaveQuota")}</CardTitle>
                <CalendarDays className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold">{t("daysCount", { count: totalAnnualQuota })}</div>
                <div className="flex flex-col gap-1 mt-1">
                  <p className={`text-xs font-medium ${remAnnual < 0 ? "text-rose-600" : "text-muted-foreground"}`}>
                    {remAnnual < 0
                      ? t("daysDebt", { count: Math.abs(remAnnual) })
                      : t("daysRemaining", { count: remAnnual })}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {t("maxDebt")}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center gap-x-1">
                <CardTitle>{t("used")}</CardTitle>
                <ArrowDownRight className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold">{t("daysCount", { count: annualLeaveUsed })}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("annualLeaveApproved")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center gap-x-1">
                <CardTitle>{t("otherLeaves")}</CardTitle>
                <Flag className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold">{t("daysCount", { count: otherLeaveUsed })}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("excuseHealthEtc")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center gap-x-1">
                <CardTitle>{t("grandTotal")}</CardTitle>
                <History className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold">
                  {t("daysCount", { count: annualLeaveUsed + otherLeaveUsed })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("allRequests")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Usage Detail */}
          <Card>
            <CardHeader>
              <CardTitle>{t("leaveUsageInfo")}</CardTitle>
              <CardDescription>
                {t("leaveUsageDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 mt-4 pb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {t("annualUsageRate")}
                  </span>
                  <span className="text-muted-foreground">
                    {t("usageRateDetail", { used: annualLeaveUsed, total: totalAnnualQuota, percent: Math.round(annualWorkProgress) })}
                  </span>
                </div>
                <Progress value={annualWorkProgress} />

                <span className="text-muted-foreground text-right block text-sm">
                  {t("nextRenewalDate", { date: nextRenewalDate })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>{t("upcomingLeaves")}</CardTitle>
              </div>
              <Badge variant="outline">{upcomingLeaves.length}</Badge>
            </CardHeader>
            <CardContent className="mt-4 pb-3">
              <div className="space-y-2">
                {upcomingLeaves.length > 0 ? (
                  upcomingLeaves.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-start gap-2 rounded-lg px-3 py-4 bg-muted/50 transition-colors"
                    >
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <CalendarDays className="size-4" />
                      </div>
                      <div className="space-y-1 w-full">
                        <CardTitle className="text-sm">
                          {req.leaveType.name}
                        </CardTitle>
                        <div className="flex items-center justify-between">
                          <CardDescription className="text-xs">
                            {formatDateLocale(req.startDate.toISOString(), locale)}{" "}
                            -{" "}
                            {formatDateLocale(req.endDate.toISOString(), locale)}
                          </CardDescription>
                          <Badge variant="secondary">
                            {formatDistanceToNow(req.startDate, {
                              locale: dateLocale,
                              addSuffix: true,
                            })}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarDays className="size-8 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {t("noPlannedLeaves")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-bold">
                {t("recentRequests")}
              </CardTitle>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/dashboard/leaves`}>
                  <History className="size-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="mt-4">
              <div className="space-y-2">
                {recentRequests.length > 0 ? (
                  recentRequests.map((req) => (
                    <Link
                      key={req.id}
                      href={`/dashboard/leaves/${req.id}`}
                      className="flex items-start gap-2 rounded-lg px-3 py-4 bg-muted/50 transition-colors justify-between"
                    >
                      <div className="space-y-1">
                        <CardTitle className="text-sm">
                          {req.leaveType.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {formatDateLocale(req.createdAt.toISOString(), locale)}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          req.status === "APPROVED"
                            ? "default"
                            : req.status === "REJECTED"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {req.status === "APPROVED"
                          ? tStatus("approvedShort")
                          : req.status === "REJECTED"
                            ? tStatus("rejectedShort")
                            : tStatus("pendingShort")}
                      </Badge>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {tCommon("noRecords")}
                  </p>
                )}
              </div>
            </CardContent>
            {recentRequests.length > 0 && (
              <CardFooter className="py-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/dashboard/leaves`}>
                    {tCommon("viewHistory")}
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
