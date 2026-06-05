"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Info } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeaveApprovals } from "./_components/use-leave-approvals";
import { RequestCard } from "./_components/request-card";

export default function LeaveApprovalsPage() {
  const t = useTranslations("leaveApprovals");
  const tCommon = useTranslations("common");
  const {
    isLoading,
    userId,
    actionLoading,
    rejectingId,
    setRejectingId,
    rejectComment,
    setRejectComment,
    handleAction,
    filterRequestsByTab,
  } = useLeaveApprovals();

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const renderTab = (tab: "pending" | "processed") => {
    const tabRequests = filterRequestsByTab(tab);
    const EmptyIcon = tab === "pending" ? CheckCircle2 : Info;
    const emptyText = tab === "pending" ? tCommon("noPendingRequests") : tCommon("noPastRequests");

    return (
      <div className="grid gap-4">
        {tabRequests.length === 0 ? (
          <Card className="border-dashed py-12 text-center">
            <EmptyIcon className="size-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{emptyText}</p>
          </Card>
        ) : (
          tabRequests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              userId={userId}
              actionLoading={actionLoading}
              rejectingId={rejectingId}
              rejectComment={rejectComment}
              setRejectingId={setRejectingId}
              setRejectComment={setRejectComment}
              onAction={handleAction}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 px-4 pb-12">
      <div>
        <CardTitle className="text-xl font-bold">{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6 bg-muted/50">
          <TabsTrigger value="pending" className="px-8">
            {tCommon("pending")}
          </TabsTrigger>
          <TabsTrigger value="processed" className="px-8">
            {tCommon("processed")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">{renderTab("pending")}</TabsContent>
        <TabsContent value="processed">{renderTab("processed")}</TabsContent>
      </Tabs>
    </div>
  );
}
