"use client";
import { apiUrl } from "@/lib/api";

import { useState, useEffect } from "react";
import Link from "next/link";

import { useTranslations } from "next-intl";
import {
  getStatusStyle,
  getStatusLabel,
  getStatusIcon,
  formatDateLocale,
} from "@/lib/status-helpers";
import { toast } from "sonner";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { useLocale } from "next-intl";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Info,
  Loader2,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceCorrection {
  id: string;
  type: "ENTRY" | "EXIT" | "BOTH";
  date: string;
  entryTime: string | null;
  exitTime: string | null;
  reason: string;
  status: string;
  createdAt: string;
  approvals: {
    id: string;
    status: string;
    approvalOrder: number;
    approverId: string;
    comment: string | null;
    approver: {
      id: string;
      name: string;
      email: string;
      role: string;
      managedDepts?: { name: string }[];
    };
  }[];
}

export default function AttendancePage() {
  const t = useTranslations("attendance");
  const confirm = useConfirm();
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const tRoles = useTranslations("roles");
  const locale = useLocale();

  const [requests, setRequests] = useState<AttendanceCorrection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch(apiUrl("/api/attendance-corrections?personal=true"));
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (requestId: string) => {
    const confirmed = await confirm({
      description: t("cancelConfirm"),
      destructive: true,
    });
    if (!confirmed) return;

    setActionLoading(requestId);
    try {
      const response = await fetch(apiUrl(`/api/attendance-corrections/${requestId}`), {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchRequests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || t("actionFailed"));
      }
    } catch (error) {
      console.error("Failed to delete request:", error);
      toast.error(tCommon("errorOccurred"));
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-4 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <CardTitle className="text-xl mb-0.5 font-medium">
            {t("title")}
          </CardTitle>
          <CardDescription>
            {t("subtitle")}
          </CardDescription>
        </div>
        <Button size="sm" asChild>
          <Link href={`/dashboard/attendance/new`}>
            <Plus className="mr-2 size-4" /> {t("newRequest")}
          </Link>
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-24 text-center">
            <div className="size-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="size-8 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t("noRequests")}</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              {t("noRequestsDesc")}
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/attendance/new`}>
                {tCommon("createFirst")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div key={request.id}>
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                        <Clock className="size-5" />
                      </div>
                      <div className="space-y-0.5">
                        <CardTitle>
                          {formatDateLocale(request.date, locale)}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {request.type === "ENTRY"
                            ? t("entryCorrection")
                            : request.type === "EXIT"
                              ? t("exitCorrection")
                              : t("entryExitCorrection")}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <Badge className={`${getStatusStyle(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {getStatusLabel(request.status, tStatus)}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {request.status === "PENDING" ? (
                            <DropdownMenuItem
                              className="text-rose-600 focus:text-rose-600"
                              disabled={actionLoading === request.id}
                              onClick={() => handleDelete(request.id)}
                            >
                              {actionLoading === request.id ? (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              ) : null}
                              {t("cancelRequest")}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem disabled className="text-muted-foreground text-xs italic">
                              Hakkında işlem yapılmış talepler iptal edilemez
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 pb-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-8">
                      <div className="flex flex-wrap items-center gap-8">
                        {request.entryTime && (
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                              <Clock className="size-5" />
                            </div>
                            <div>
                              <CardDescription>{t("entryTime")}</CardDescription>
                              <p className="text-sm font-bold">
                                {request.entryTime}
                              </p>
                            </div>
                          </div>
                        )}
                        {request.entryTime && request.exitTime && (
                          <ArrowRight className="size-4 text-foreground hidden sm:block opacity-30" />
                        )}
                        {request.exitTime && (
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl">
                              <Clock className="size-5" />
                            </div>
                            <div>
                              <CardDescription>{t("exitTime")}</CardDescription>
                              <p className="text-sm font-bold">
                                {request.exitTime}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-start gap-4">
                        <Info className="size-4 text-primary mt-0.5 opacity-50" />
                        <div>
                          <CardDescription>{tCommon("reason")}</CardDescription>
                          <CardDescription className="text-foreground mt-1 text-sm">
                            &quot;{request.reason}&quot;
                          </CardDescription>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-4 border-l pl-8 space-y-6">
                      <div>
                        <CardTitle className="text-sm">{tCommon("approvalFlow")}</CardTitle>
                        <div className="space-y-6 mt-4">
                          {request.approvals
                            .sort((a, b) => a.approvalOrder - b.approvalOrder)
                            .map((approval, idx) => (
                              <div
                                key={approval.id}
                                className="relative flex items-start gap-3"
                              >
                                {idx !== request.approvals.length - 1 && (
                                  <div className="absolute left-3 top-7 w-px h-[calc(100%+12px)] bg-border" />
                                )}
                                <div
                                  className={`mt-0.5 size-6 rounded-full border flex items-center justify-center z-10 transition-colors
                                                                    ${approval.status ===
                                      "APPROVED"
                                      ? "bg-emerald-500 border-emerald-500"
                                      : approval.status ===
                                        "REJECTED"
                                        ? "bg-rose-500 border-rose-500"
                                        : "bg-background border-border"
                                    }`}
                                >
                                  {approval.status === "APPROVED" ? (
                                    <CheckCircle2 className="size-3 text-white" />
                                  ) : approval.status === "REJECTED" ? (
                                    <XCircle className="size-3 text-white" />
                                  ) : (
                                    <div className="size-1.5 rounded-full bg-muted-foreground/30" />
                                  )}
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-medium">
                                    {approval.approver.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground uppercase">
                                    {approval.approver.managedDepts?.[0]
                                      ?.name ||
                                      (approval.approver.role ===
                                        "COMPANY_ADMIN"
                                        ? tRoles("hrManager")
                                        : tRoles("unitManager"))}{" "}
                                    ·{" "}
                                    {approval.status === "PENDING"
                                      ? tStatus("pending")
                                      : tStatus("processed")}
                                  </p>
                                  {approval.comment && (
                                    <p className="text-[10px] text-muted-foreground italic mt-0.5">
                                      &quot;{approval.comment}&quot;
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
