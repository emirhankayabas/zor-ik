"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  getStatusStyle,
  getStatusLabel as getBaseStatusLabel,
  getStatusIcon,
  formatDateLocale,
} from "@/lib/status-helpers";
import {
  Calendar as CalendarIcon,
  Clock,
  MoreHorizontal,
  Info,
  Loader2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { ApprovalTimeline } from "@/components/shared/approval-timeline";
import type { AttendanceCorrection } from "./types";

interface Props {
  request: AttendanceCorrection;
  isHR: boolean;
  userId?: string;
  actionLoading: string | null;
  rejectingId: string | null;
  rejectComment: string;
  setRejectingId: (id: string | null) => void;
  setRejectComment: (comment: string) => void;
  onAction: (
    id: string,
    action: "APPROVED" | "REJECTED",
    comment?: string,
  ) => void;
}

export function RequestCard({
  request,
  isHR,
  userId,
  actionLoading,
  rejectingId,
  rejectComment,
  setRejectingId,
  setRejectComment,
  onAction,
}: Props) {
  const t = useTranslations("attendanceRequests");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const locale = useLocale();

  const isProcessing = actionLoading === request.id;
  const getStatusLabel = (status: string) => getBaseStatusLabel(status, tStatus);

  // Find the relevant approval step for the current user
  const myApproval = request.approvals.find((a) => {
    if (a.approverId === userId) return true;
    if (isHR && a.approvalOrder === 2) return true;
    return false;
  });

  const managerApproval = request.approvals.find((a) => a.approvalOrder === 1);
  const canApprove =
    myApproval?.status === "PENDING" &&
    (myApproval.approvalOrder === 1 ||
      (myApproval.approvalOrder === 2 &&
        (!managerApproval || managerApproval.status === "APPROVED")));

  return (
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
                <span>
                  {request.type === "ENTRY"
                    ? t("entryCorrection")
                    : request.type === "EXIT"
                      ? t("exitCorrection")
                      : t("bothCorrection")}
                </span>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center">
            <Badge className={`${getStatusStyle(request.status)}`}>
              {getStatusIcon(request.status)}
              {getStatusLabel(request.status)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>{tCommon("requestDetails")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                  <CardDescription>{t("requestDate")}</CardDescription>
                  <p className="text-sm font-bold">
                    {formatDateLocale(request.date, locale)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                {request.entryTime && (
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <CardDescription>{t("newEntry")}</CardDescription>
                      <p className="text-sm font-bold">{request.entryTime}</p>
                    </div>
                  </div>
                )}
                {request.exitTime && (
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <CardDescription>{t("newExit")}</CardDescription>
                      <p className="text-sm font-bold">{request.exitTime}</p>
                    </div>
                  </div>
                )}
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
            <ApprovalTimeline approvals={request.approvals} />
          </div>
        </div>
      </CardContent>
      {canApprove && (
        <CardFooter className="bg-muted/10 border-t py-3 flex flex-col gap-2 sm:px-6">
          {rejectingId === request.id ? (
            <div className="w-full space-y-2">
              <Textarea
                placeholder={t("rejectReasonPlaceholder")}
                value={rejectComment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setRejectComment(e.target.value)
                }
                className="min-h-[60px] text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRejectingId(null);
                    setRejectComment("");
                  }}
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onAction(request.id, "REJECTED", rejectComment);
                    setRejectingId(null);
                    setRejectComment("");
                  }}
                  disabled={!!isProcessing}
                >
                  {tCommon("reject")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-2 w-full">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setRejectingId(request.id)}
                disabled={!!isProcessing}
              >
                {tCommon("reject")}
              </Button>
              <Button
                size="sm"
                onClick={() => onAction(request.id, "APPROVED")}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  tCommon("approve")
                )}
              </Button>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
