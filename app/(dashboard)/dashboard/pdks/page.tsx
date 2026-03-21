"use client";
import { apiUrl } from "@/lib/api";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Clock,
  AlertTriangle,
  Timer,
  TrendingUp,
  Search,
  Fingerprint,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";
import { formatDateLocale, toLocalDateString } from "@/lib/status-helpers";
import { useTranslations, useLocale } from "next-intl";

interface AttendanceLog {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  lateMinutes: number;
  earlyMinutes: number;
  overtimeMinutes: number;
  totalWorkMinutes: number;
  source: "CARD" | "MANUAL" | "CORRECTION";
  employee: {
    user: { name: string; email: string };
    department: { name: string } | null;
    shift: { name: string; startTime: string; endTime: string } | null;
  };
}

interface Department {
  id: string;
  name: string;
}

function formatMinutes(minutes: number, t: any): string {
  if (minutes === 0) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}${t("minutes")}`;
  return `${h}${t("hours")} ${m}${t("minutes")}`;
}

function formatTime(isoStr: string | null, locale: string): string {
  if (!isoStr) return "-";
  return new Date(isoStr).toLocaleTimeString(locale === "tr" ? "tr-TR" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(log: AttendanceLog, t: any) {
  if (!log.checkIn) {
    return (
      <Badge variant="outline" className="text-[10px] text-muted-foreground">
        {t("noRecord")}
      </Badge>
    );
  }
  if (log.checkIn && !log.checkOut) {
    return (
      <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-500/10">
        {t("awaitingExit")}
      </Badge>
    );
  }
  if (log.lateMinutes > 0) {
    return (
      <Badge className="text-[10px] bg-rose-500/10 text-rose-600 border-none">
        {t("lateEntry")}
      </Badge>
    );
  }
  if (log.overtimeMinutes > 0) {
    return (
      <Badge className="text-[10px] bg-blue-500/10 text-blue-600 border-none">
        {t("overtime")}
      </Badge>
    );
  }
  return (
    <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-none">
      {t("onTime")}
    </Badge>
  );
}

export default function PDKSPage() {
  const t = useTranslations("pdks");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedDept, setSelectedDept] = useState("all");

  // Access check: Admin, Manager or İK only
  const isAllowed =
    sessionStatus !== "authenticated"
      ? null // not yet determined
      : session?.user?.role === "COMPANY_ADMIN" ||
        session?.user?.role === "SUPER_ADMIN" ||
        session?.user?.role === "MANAGER" ||
        (session?.user as any)?.departmentName === "İK" ||
        (session?.user as any)?.departmentName === "İnsan Kaynakları";

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", toLocalDateString(startDate));
      if (endDate) params.set("endDate", toLocalDateString(endDate));
      if (selectedDept && selectedDept !== "all") params.set("departmentId", selectedDept);

      const response = await fetch(apiUrl(`/api/pdks/logs?${params}`));
      if (response.ok) {
        setLogs(await response.json());
      } else if (response.status === 403) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch PDKS logs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, selectedDept, router]);

  useEffect(() => {
    fetch(apiUrl("/api/departments"))
      .then((r) => (r.ok ? r.json() : []))
      .then(setDepartments)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isAllowed === null) return; // still loading
    if (isAllowed === false) {
      router.push("/dashboard");
      return;
    }
    fetchLogs();
  }, [isAllowed, fetchLogs, router]);

  // Client-side name filter
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.employee.user.name?.toLowerCase().includes(q) ||
      log.employee.department?.name?.toLowerCase().includes(q)
    );
  });

  // Summary stats
  const totalLateMinutes = filteredLogs.reduce((s, l) => s + l.lateMinutes, 0);
  const totalOvertimeMinutes = filteredLogs.reduce((s, l) => s + l.overtimeMinutes, 0);
  const avgWorkMinutes =
    filteredLogs.length > 0
      ? Math.round(
          filteredLogs.reduce((s, l) => s + l.totalWorkMinutes, 0) /
            filteredLogs.length,
        )
      : 0;
  const missingCheckouts = filteredLogs.filter(
    (l) => l.checkIn && !l.checkOut,
  ).length;

  if (isLoading || sessionStatus === "loading") {
    return (
      <div className="space-y-6 px-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-12">
      <div>
        <CardTitle className="text-xl mb-0.5 font-medium">
          {t("title")}
        </CardTitle>
        <CardDescription>
          {t("subtitle")}
        </CardDescription>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex items-center gap-x-1">
            <CardTitle>{t("totalRecords")}</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{filteredLogs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("shownPeriod")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center gap-x-1">
            <CardTitle>{t("lateEntry")}</CardTitle>
            <AlertTriangle className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-amber-600">
              {formatMinutes(totalLateMinutes, t)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("totalLate")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center gap-x-1">
            <CardTitle>{t("overtime")}</CardTitle>
            <TrendingUp className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold text-emerald-600">
              {formatMinutes(totalOvertimeMinutes, t)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("totalOvertime")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center gap-x-1">
            <CardTitle>{t("avgWork")}</CardTitle>
            <Timer className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">
              {formatMinutes(avgWorkMinutes, t)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dailyAverage")}
              {missingCheckouts > 0 && (
                <span className="text-amber-600 ml-1">
                  {t("missingCheckouts", { count: missingCheckouts })}
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Table */}
      <Card>
        <CardHeader className="pb-4 border-b bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger>
                <SelectValue placeholder={tCommon("department")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allDepartments")}</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DatePicker
              date={startDate}
              setDate={setStartDate}
              placeholder={tCommon("startDate")}
            />
            <DatePicker
              date={endDate}
              setDate={setEndDate}
              placeholder={tCommon("endDate")}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="p-16 text-center">
              <Fingerprint className="size-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-1">{t("noRecords")}</h3>
              <p className="text-muted-foreground text-sm">
                {t("noRecordsDesc")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("personnel")}</TableHead>
                  <TableHead>{tCommon("date")}</TableHead>
                  <TableHead>{t("entry")}</TableHead>
                  <TableHead>{t("exit")}</TableHead>
                  <TableHead>{t("netWork")}</TableHead>
                  <TableHead>{tCommon("status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium text-sm">
                          {log.employee.user.name}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {log.employee.department?.name || "—"}
                          {log.employee.shift && (
                            <span className="ml-1 opacity-60">
                              · {log.employee.shift.name}
                            </span>
                          )}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {formatDateLocale(log.date, locale)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatTime(log.checkIn, locale)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.checkOut ? (
                        formatTime(log.checkOut, locale)
                      ) : log.checkIn ? (
                        <span className="text-amber-600 text-xs">{t("missing")}</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {formatMinutes(log.totalWorkMinutes, t)}
                    </TableCell>
                    <TableCell>{getStatusBadge(log, t)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
