"use client";
import { apiUrl } from "@/lib/api";

import { useState, useEffect, useCallback } from "react";

import { useSession } from "next-auth/react";
import {
  getStatusStyle,
  getStatusLabel,
  getStatusIcon,
  formatDateLocale,
} from "@/lib/status-helpers";
import { useTranslations, useLocale } from "next-intl";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  ArrowRight,
  Info,
  Loader2,
  AlertCircle,
  ChevronDown,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  actualDays: number;
  reason: string;
  status: string;
  createdAt: string;
  employee: {
    totalLeftLeaveDays: number;
    annualLeaveQuota: number;
    user: {
      name: string;
      email: string;
    };
    department: {
      name: string;
    } | null;
  };
  leaveType: {
    name: string;
  };
  approvals: {
    id: string;
    status: string;
    approvalOrder: number;
    approver: {
      id: string;
      name: string;
      managedDepts?: { name: string }[];
    };
  }[];
}

export default function HRApprovalsPage() {
  const { data: session } = useSession();
  const t = useTranslations("hr");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const tRoles = useTranslations("roles");
  const locale = useLocale();
    
  const [categorizedRequests, setCategorizedRequests] = useState<{
    pending: LeaveRequest[];
    approved: LeaveRequest[];
    rejected: LeaveRequest[];
  }>({
    pending: [],
    approved: [],
    rejected: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchHRRequests = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(apiUrl("/api/leave-requests"));
      const data: LeaveRequest[] = await response.json();

      // Filter for requests where İK (approvalOrder: 2)
      const filtered = data.reduce(
        (acc, request) => {
          const ikApproval = request.approvals.find(
            (a) => a.approvalOrder === 2,
          );
          if (!ikApproval) return acc;

          const managerApproval = request.approvals.find(
            (a) => a.approvalOrder === 1,
          );

          // For Pending: İK is PENDING AND Manager is APPROVED (or nonexistent)
          if (
            ikApproval.status === "PENDING" &&
            (!managerApproval || managerApproval.status === "APPROVED")
          ) {
            acc.pending.push(request);
          } else if (ikApproval.status === "APPROVED") {
            acc.approved.push(request);
          } else if (ikApproval.status === "REJECTED") {
            acc.rejected.push(request);
          }

          return acc;
        },
        {
          pending: [],
          approved: [],
          rejected: [],
        } as typeof categorizedRequests,
      );

      setCategorizedRequests(filtered);
    } catch (error) {
      console.error("Failed to fetch HR requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchHRRequests();
  }, [fetchHRRequests]);

  const handleAction = async (
    requestId: string,
    action: "APPROVED" | "REJECTED",
  ) => {
    setActionLoading(requestId);
    try {
      const response = await fetch(apiUrl(`/api/leave-requests/${requestId}/approve`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await fetchHRRequests();
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const RequestCard = ({ request }: { request: LeaveRequest }) => {
    const isProcessing = actionLoading === request.id;
    const ikApproval = request.approvals.find((a) => a.approvalOrder === 2);

    return (
      <div key={request.id}>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-8 border-background shadow-none">
                  <AvatarFallback className="bg-primary/5 text-primary font-bold">
                    {request.employee.user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <CardTitle>{request.employee.user.name}</CardTitle>
                  <CardDescription className="flex items-center gap-x-2 text-xs">
                    <span>{request.employee.department?.name || tCommon("general")}</span>
                    <Separator orientation="vertical" className="h-3 mt-0.5" />
                    <div className="flex items-center gap-2">
                      <span>{request.leaveType.name}</span>
                      {request.leaveType.name === tCommon("annualLeave") && request.actualDays > (request.employee.totalLeftLeaveDays || 0) && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4 bg-rose-50 text-rose-600 border-rose-200">
                          {tCommon("advanceLeave")}
                        </Badge>
                      )}
                    </div>
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-center">
                <Badge className={`${getStatusStyle(request.status)}`}>
                  {getStatusIcon(request.status)}
                  {getStatusLabel(request.status, tStatus)}
                </Badge>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/dashboard/leaves/${request.id}`}>
                    <MoreHorizontal className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-8">
                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                      <CalendarIcon className="size-5" />
                    </div>
                    <div>
                      <CardDescription>{tCommon("startDate")}</CardDescription>
                      <p className="text-sm font-bold">
                        {formatDateLocale(request.startDate, locale)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-foreground hidden sm:block opacity-30" />
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                      <CalendarIcon className="size-5" />
                    </div>
                    <div>
                      <CardDescription>{tCommon("endDate")}</CardDescription>
                      <p className="text-sm font-bold">
                        {formatDateLocale(request.endDate, locale)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Info className="size-4 text-primary mt-0.5 opacity-50" />
                  <div>
                    <CardDescription>{tCommon("reason")}</CardDescription>
                    <CardDescription className="text-foreground mt-1">
                      "{request.reason}"
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
                              {approval.approver.managedDepts?.[0]?.name ||
                                (approval.approvalOrder === 2
                                  ? tRoles("hrManager")
                                  : tRoles("unitManager"))}{" "}
                              ·{" "}
                              {approval.status === "PENDING"
                                ? tStatus("pending")
                                : tStatus("processed")}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          {ikApproval?.status === "PENDING" && (
            <CardFooter className="bg-muted/10 border-t py-3 flex justify-end items-center sm:px-6">
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleAction(request.id, "REJECTED")}
                  disabled={!!isProcessing}
                >
                  {tCommon("reject")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAction(request.id, "APPROVED")}
                  disabled={!!isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    tCommon("approve")
                  )}
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/leaves/${request.id}`}>
              {tCommon("viewDetails")} <ChevronDown className="size-3" />
            </Link>
          </Button>
        </div>
      </div>
    );
  };

  const EmptyState = ({
    message,
    icon: Icon = CheckCircle2,
  }: {
    message: string;
    icon?: any;
  }) => (
    <Card className="border-dashed py-12 text-center">
      <Icon className="size-12 text-muted-foreground/30 mx-auto mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-4 pb-12">
      <div>
        <CardTitle className="text-xl font-bold">{t("title")}</CardTitle>
        <CardDescription>
          {t("subtitle")}
        </CardDescription>
      </div>

      {(session?.user as any)?.departmentName !== "İK" &&
        (session?.user as any)?.departmentName !== "İnsan Kaynakları" &&
        (session?.user as any)?.role !== "COMPANY_ADMIN" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{tCommon("unauthorized")}</AlertTitle>
            <AlertDescription>
              {t("unauthorizedDesc")}
            </AlertDescription>
          </Alert>
        )}

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6 bg-muted/50">
          <TabsTrigger value="pending" className="px-8 gap-2">
            {tCommon("pending")}
            {categorizedRequests.pending.length > 0 && (
              <Badge
                variant="secondary"
                className="h-4 px-1 min-w-4 text-[10px]"
              >
                {categorizedRequests.pending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="processed" className="px-8">
            {tCommon("processed")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {categorizedRequests.pending.length === 0 ? (
              <EmptyState message={t("noPending")} />
            ) : (
              categorizedRequests.pending.map((req) => (
                <RequestCard key={req.id} request={req} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="processed">
          <Tabs defaultValue="approved" className="w-full">
            <TabsList className="mb-4 bg-muted/20 w-fit">
              <TabsTrigger value="approved" className="text-xs">
                {tCommon("approved")} ({categorizedRequests.approved.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs">
                {tCommon("rejected")} ({categorizedRequests.rejected.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="approved">
              <div className="grid gap-4">
                {categorizedRequests.approved.length === 0 ? (
                  <EmptyState message={t("noApproved")} />
                ) : (
                  categorizedRequests.approved.map((req) => (
                    <RequestCard key={req.id} request={req} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="rejected">
              <div className="grid gap-4">
                {categorizedRequests.rejected.length === 0 ? (
                  <EmptyState
                    message={t("noRejected")}
                    icon={Info}
                  />
                ) : (
                  categorizedRequests.rejected.map((req) => (
                    <RequestCard key={req.id} request={req} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
