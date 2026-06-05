"use client";

import { useTranslations } from "next-intl";
import { Info, AlertCircle } from "lucide-react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHrApprovals } from "./_components/use-hr-approvals";
import { RequestCard } from "./_components/request-card";
import { EmptyState } from "./_components/empty-state";

export default function HRApprovalsPage() {
  const t = useTranslations("hr");
  const tCommon = useTranslations("common");
  const { categorizedRequests, isLoading, actionLoading, isAuthorized, handleAction } =
    useHrApprovals();

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const renderList = (items: typeof categorizedRequests.pending, emptyMessage: string, emptyIcon?: typeof Info) => (
    <div className="grid gap-4">
      {items.length === 0 ? (
        <EmptyState message={emptyMessage} icon={emptyIcon} />
      ) : (
        items.map((req) => (
          <RequestCard
            key={req.id}
            request={req}
            isProcessing={actionLoading === req.id}
            onAction={handleAction}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8 px-4 pb-12">
      <div>
        <CardTitle className="text-xl font-bold">{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </div>

      {!isAuthorized && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{tCommon("unauthorized")}</AlertTitle>
          <AlertDescription>{t("unauthorizedDesc")}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6 bg-muted/50">
          <TabsTrigger value="pending" className="px-8 gap-2">
            {tCommon("pending")}
            {categorizedRequests.pending.length > 0 && (
              <Badge variant="secondary" className="h-4 px-1 min-w-4 text-[10px]">
                {categorizedRequests.pending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="processed" className="px-8">
            {tCommon("processed")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {renderList(categorizedRequests.pending, t("noPending"))}
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
              {renderList(categorizedRequests.approved, t("noApproved"))}
            </TabsContent>

            <TabsContent value="rejected">
              {renderList(categorizedRequests.rejected, t("noRejected"), Info)}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
