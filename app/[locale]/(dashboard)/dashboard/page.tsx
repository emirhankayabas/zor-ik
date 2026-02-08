import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Users,
  Building2,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Flag,
  Plus,
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
import { tr } from "date-fns/locale";
import Link from "next/link";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerAuthSession();

  if (!session) return null;

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
    let renewalThisYear = new Date(hireDate);
    renewalThisYear.setFullYear(currentYear);

    if (renewalThisYear < now) {
      renewalThisYear.setFullYear(currentYear + 1);
    }
    nextRenewalDate = renewalThisYear.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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
            Hoş Geldiniz, {session.user.name}
          </CardTitle>
          <CardDescription>
            İzin durumunuzu ve şirket bilgilerini buradan takip edebilirsiniz.
          </CardDescription>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Stats */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex items-center gap-x-1">
                <CardTitle>Yıllık İzin Hakkı</CardTitle>
                <CalendarDays className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold">{totalAnnualQuota} Gün</div>
                <div className="flex flex-col gap-1 mt-1">
                  <p className={`text-xs font-medium ${remAnnual < 0 ? "text-rose-600" : "text-muted-foreground"}`}>
                    {remAnnual < 0
                      ? `${Math.abs(remAnnual)} Gün Borç`
                      : `${remAnnual} Gün Kalan`}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Maksimum borçlanma: 5 Gün
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center gap-x-1">
                <CardTitle>Kullanılan</CardTitle>
                <ArrowDownRight className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold">{annualLeaveUsed} Gün</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Yıllık İzin (Onaylı)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center gap-x-1">
                <CardTitle>Diğer İzinler</CardTitle>
                <Flag className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold">{otherLeaveUsed} Gün</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Mazeret, Sağlık vb.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center gap-x-1">
                <CardTitle>Genel Toplam</CardTitle>
                <History className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold">
                  {annualLeaveUsed + otherLeaveUsed} Gün
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tüm Talepler
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Usage Detail */}
          <Card>
            <CardHeader>
              <CardTitle>İzin Kullanım Bilgileri</CardTitle>
              <CardDescription>
                Yıllık izin durumunuzun detaylı özeti.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 mt-4 pb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    Yıllık İzin Kullanım Oranı
                  </span>
                  <span className="text-muted-foreground">
                    {annualLeaveUsed} / {totalAnnualQuota} Gün ( %
                    {Math.round(annualWorkProgress)} )
                  </span>
                </div>
                <Progress value={annualWorkProgress} />

                <span className="text-muted-foreground text-right block text-sm">
                  Sonraki Devir Tarihi: {nextRenewalDate}
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
                <CardTitle>Yaklaşan İzinler</CardTitle>
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
                            {new Date(req.startDate).toLocaleDateString(
                              "tr-TR",
                            )}{" "}
                            -{" "}
                            {new Date(req.endDate).toLocaleDateString("tr-TR")}
                          </CardDescription>
                          <Badge variant="secondary">
                            {formatDistanceToNow(req.startDate, {
                              locale: tr,
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
                      Planlanmış izin bulunmuyor.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-bold">
                Son Taleplerim
              </CardTitle>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/${locale}/dashboard/leaves`}>
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
                      href={`/${locale}/dashboard/leaves/${req.id}`}
                      className="flex items-start gap-2 rounded-lg px-3 py-4 bg-muted/50 transition-colors justify-between"
                    >
                      <div className="space-y-1">
                        <CardTitle className="text-sm">
                          {req.leaveType.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {new Date(req.createdAt).toLocaleDateString("tr-TR")}
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
                          ? "Onay"
                          : req.status === "REJECTED"
                            ? "Red"
                            : "Bekliyor"}
                      </Badge>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Kayıt bulunamadı.
                  </p>
                )}
              </div>
            </CardContent>
            {recentRequests.length > 0 && (
              <CardFooter className="py-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/${locale}/dashboard/leaves`}>
                    Tüm Geçmişi Görüntüle
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
