"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import { CardTitle } from "@/components/ui/card";

export interface ApprovalStep {
  id: string;
  status: string;
  approvalOrder: number;
  comment?: string | null;
  approver: {
    name: string;
    role?: string;
    managedDepts?: { name: string }[];
  };
}

interface Props {
  approvals: ApprovalStep[];
}

/**
 * İki aşamalı (yönetici → İK) onay akışını dikey zaman çizelgesi olarak gösterir.
 * Üç onay sayfasında tekrar eden timeline'ın tek kaynağı. Varsa onaylayan yorumu
 * da gösterilir (yorumu olmayan akışlarda otomatik gizlenir).
 */
export function ApprovalTimeline({ approvals }: Props) {
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const tRoles = useTranslations("roles");

  return (
    <div>
      <CardTitle className="text-sm">{tCommon("approvalFlow")}</CardTitle>
      <div className="space-y-6 mt-4">
        {approvals
          .slice()
          .sort((a, b) => a.approvalOrder - b.approvalOrder)
          .map((approval, idx) => {
            const isHrStep =
              approval.approvalOrder === 2 || approval.approver.role === "COMPANY_ADMIN";
            return (
              <div key={approval.id} className="relative flex items-start gap-3">
                {idx !== approvals.length - 1 && (
                  <div className="absolute left-3 top-7 w-px h-[calc(100%+12px)] bg-border" />
                )}
                <div
                  className={`mt-0.5 size-6 rounded-full border flex items-center justify-center z-10 transition-colors
                    ${
                      approval.status === "APPROVED"
                        ? "bg-emerald-500 border-emerald-500"
                        : approval.status === "REJECTED"
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
                  <p className="text-xs font-medium">{approval.approver.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {approval.approver.managedDepts?.[0]?.name ||
                      (isHrStep ? tRoles("hrManager") : tRoles("unitManager"))}{" "}
                    ·{" "}
                    {approval.status === "PENDING"
                      ? tStatus("pending")
                      : tStatus("processed")}
                  </p>
                  {approval.comment && (
                    <p className="text-[10px] text-muted-foreground italic mt-0.5 font-medium">
                      &quot;{approval.comment}&quot;
                    </p>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
