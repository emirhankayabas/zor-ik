"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  getStatusStyle,
  getStatusLabel,
  getStatusIcon,
  formatDateLocale,
} from "@/lib/status-helpers";
import {
  Calendar as CalendarIcon,
  MoreHorizontal,
  ArrowRight,
  Info,
  Loader2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { ApprovalTimeline } from "@/components/shared/approval-timeline";
import type { LeaveRequest } from "./types";

interface Props {
  request: LeaveRequest;
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
  userId,
  actionLoading,
  rejectingId,
  rejectComment,
  setRejectingId,
  setRejectComment,
  onAction,
}: Props) {
  const t = useTranslations("leaveApprovals");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const locale = useLocale();

  const myApproval = request.approvals.find((a) => a.approverId === userId);

  return (
    <div>
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
                    {request.leaveType.name === tCommon("annualLeave") &&
                      request.actualDays > (request.employee.totalLeftLeaveDays || 0) && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 h-4 bg-rose-50 text-rose-600 border-rose-200"
                        >
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/leaves/${request.id}`}>
                      {tCommon("requestDetails")}
                    </Link>
                  </DropdownMenuItem>
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
                    &quot;{request.reason}&quot;
                  </CardDescription>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 border-l pl-8 space-y-6">
              <ApprovalTimeline approvals={request.approvals} />
            </div>
          </div>
        </CardContent>
        {myApproval?.status === "PENDING" && (
          <CardFooter className="bg-muted/10 border-t py-3 flex flex-col gap-2 sm:px-6">
            {rejectingId === request.id ? (
              <div className="w-full space-y-2">
                <Textarea
                  placeholder={tCommon("writeRejectReason")}
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
                    disabled={!!actionLoading}
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
                  disabled={!!actionLoading}
                >
                  {tCommon("reject")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAction(request.id, "APPROVED")}
                  disabled={!!actionLoading}
                >
                  {actionLoading === request.id ? (
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
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/leaves/${request.id}`}>
            {tCommon("viewDetails")} <ChevronDown className="size-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
