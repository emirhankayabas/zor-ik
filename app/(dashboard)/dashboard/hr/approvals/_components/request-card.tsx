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
import { ApprovalTimeline } from "@/components/shared/approval-timeline";
import type { LeaveRequest } from "./types";

interface Props {
  request: LeaveRequest;
  isProcessing: boolean;
  onAction: (requestId: string, action: "APPROVED" | "REJECTED") => void;
}

export function RequestCard({ request, isProcessing, onAction }: Props) {
  const t = useTranslations("hr");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const locale = useLocale();

  const ikApproval = request.approvals.find((a) => a.approvalOrder === 2);

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
              <ApprovalTimeline approvals={request.approvals} />
            </div>
          </div>
        </CardContent>
        {ikApproval?.status === "PENDING" && (
          <CardFooter className="bg-muted/10 border-t py-3 flex justify-end items-center sm:px-6">
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onAction(request.id, "REJECTED")}
                disabled={!!isProcessing}
              >
                {tCommon("reject")}
              </Button>
              <Button
                size="sm"
                onClick={() => onAction(request.id, "APPROVED")}
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
}
