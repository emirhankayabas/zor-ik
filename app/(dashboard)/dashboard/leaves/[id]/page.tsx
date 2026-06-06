"use client";
import { apiUrl } from "@/lib/api";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Building2,
  FileText,
  Loader2,
  Check,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { useTranslations, useLocale } from "next-intl";
import { formatDateLocale, getStatusLabel, getStatusStyle, getStatusIcon } from "@/lib/status-helpers";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
  employee: {
    userId: string;
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
    description: string | null;
  };
  approvals: {
    id: string;
    status: string;
    approvalOrder: number;
    approverId: string;
    comment: string | null;
    processedAt: string | null;
    approver: {
      id: string;
      name: string;
      email: string;
      role: string;
      managedDepts?: { name: string }[];
    };
  }[];
}

export default function LeaveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: session } = useSession();
  const t = useTranslations("leaves");
  const confirm = useConfirm();
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const tRoles = useTranslations("roles");
  const locale = useLocale();

  const [request, setRequest] = useState<LeaveRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(apiUrl(`/api/leave-requests/${id}`));
        if (response.ok) {
          const detail: LeaveRequest = await response.json();
          setRequest(detail);
        }
      } catch (error) {
        console.error("Failed to fetch leave detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  const handleAction = async (action: "APPROVED" | "REJECTED", comment?: string) => {
    setIsProcessing(action);
    try {
      const response = await fetch(apiUrl(`/api/leave-requests/${id}/approve`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment }),
      });

      if (response.ok) {
        const res = await fetch(apiUrl(`/api/leave-requests/${id}`));
        if (res.ok) {
          const updated: LeaveRequest = await res.json();
          setRequest(updated);
        }
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancel = async () => {
    const confirmed = await confirm({
      description: t("cancelConfirm"),
      destructive: true,
    });
    if (!confirmed) return;

    setIsProcessing("CANCEL");
    try {
      const response = await fetch(apiUrl(`/api/leave-requests/${id}`), {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(`/dashboard/leaves`);
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || t("cancelError"));
      }
    } catch (error) {
      console.error("Cancel failed:", error);
      toast.error(tCommon("errorOccurred"));
    } finally {
      setIsProcessing(null);
    }
  };

  const canApprove = () => {
    if (!session?.user?.id || !request) return false;

    // Find the current pending approval level
    const pendingApprovals = request.approvals
      .filter((a) => a.status === "PENDING")
      .sort((a, b) => a.approvalOrder - b.approvalOrder);

    if (pendingApprovals.length === 0) return false;

    // Only the first pending approval in the order can be acted upon
    const currentApproval = pendingApprovals[0];

    // Check if the current user is the approver for this step
    return currentApproval.approverId === session.user.id;
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={`${getStatusStyle(status)}`}>
        {getStatusIcon(status)}
        {getStatusLabel(status, tStatus)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 space-y-4">
        <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
          <FileText className="size-8" />
        </div>
        <h2 className="text-2xl font-bold">{t("detailNotFound")}</h2>
        <p className="text-muted-foreground">
          {t("detailNotFoundDesc")}
        </p>
        <Button onClick={() => router.back()}>{tCommon("back")}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          {request.status === "PENDING" &&
            request.employee.userId === session?.user?.id && (
              <>
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <Link href={`/dashboard/leaves/${id}/edit`}>
                    <Pencil className="size-3" /> {tCommon("edit")}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/5"
                  onClick={handleCancel}
                  disabled={!!isProcessing}
                >
                  {isProcessing === "CANCEL" ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Trash2 className="size-3" />
                  )}
                  {t("cancelRequest")}
                </Button>
              </>
            )}
          {getStatusBadge(request.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <User className="size-6" />
                </div>
                <div>
                  <CardTitle>{request.employee.user.name}</CardTitle>
                  <CardDescription>
                    {request.employee.user.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 pb-4 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <CardDescription>{tCommon("department")}</CardDescription>
                  <div className="flex items-center gap-2 font-medium">
                    <Building2 className="size-4 text-primary" />
                    {request.employee.department?.name || tCommon("general")}
                  </div>
                </div>
                <div className="space-y-1">
                  <CardDescription>{t("leaveType")}</CardDescription>
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="size-4 text-primary" />
                    {request.leaveType.name}
                  </div>
                </div>
                <div className="space-y-1">
                  <CardDescription>{t("startDate")}</CardDescription>
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="size-4 text-primary" />
                    {formatDateLocale(request.startDate, locale)}
                  </div>
                </div>
                <div className="space-y-1">
                  <CardDescription>{t("endDate")}</CardDescription>
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="size-4 text-primary" />
                    {formatDateLocale(request.endDate, locale)}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <CardDescription>{t("reason")}</CardDescription>
                <p className="">&quot;{request.reason}&quot;</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base mb-3">{t("approvalHistory")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pb-4">
              {request.approvals.map((approval, idx) => (
                <div key={approval.id} className="relative pl-6 space-y-1">
                  {idx !== request.approvals.length - 1 && (
                    <div className="absolute left-1.75 top-4 w-px h-[calc(100%+24px)] bg-border" />
                  )}
                  <div
                    className={`absolute left-0 top-1 size-3 rounded-full border-2 bg-background z-10
                    ${approval.status === "APPROVED"
                        ? "border-emerald-500 bg-emerald-500"
                        : approval.status === "REJECTED"
                          ? "border-rose-500 bg-rose-500"
                          : "border-muted-foreground/30"
                      }`}
                  />
                  <p className="text-sm font-bold leading-none">
                    {approval.approver.name}
                  </p>
                  <CardDescription className="text-xs">
                    {approval.approver.managedDepts?.[0]?.name ||
                      (approval.approver.role === "COMPANY_ADMIN"
                        ? tRoles("hrManager")
                        : tRoles("unitManager"))}
                  </CardDescription>
                  <CardDescription className="text-xs font-medium">
                    {approval.status === "PENDING" ? (
                      <span className="text-amber-600">{tStatus("pending")}</span>
                    ) : approval.status === "APPROVED" ? (
                      <span className="text-emerald-600">{tStatus("approved")}</span>
                    ) : (
                      <span className="text-rose-600">{tStatus("rejected")}</span>
                    )}
                  </CardDescription>
                  {approval.comment && (
                    <p className="text-[11px] text-muted-foreground mt-1 italic">
                      &quot;{approval.comment}&quot;
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
            {request.status === "PENDING" && canApprove() && (
              <CardFooter className="flex flex-col gap-2 border-t pt-4 pb-3">
                <Button
                  className="w-full gap-2"
                  onClick={() => handleAction("APPROVED")}
                  disabled={!!isProcessing}
                >
                  {isProcessing === "APPROVED" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  {tCommon("approve")}
                </Button>
                {showRejectInput ? (
                  <div className="w-full space-y-2">
                    <Textarea
                      placeholder={t("rejectReasonPlaceholder")}
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => { setShowRejectInput(false); setRejectComment(""); }}
                      >
                        {tCommon("cancel")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAction("REJECTED", rejectComment)}
                        disabled={!!isProcessing}
                      >
                        {isProcessing === "REJECTED" ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          tCommon("reject")
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setShowRejectInput(true)}
                    disabled={!!isProcessing}
                  >
                    <X className="size-4" />
                    {tCommon("reject")}
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
