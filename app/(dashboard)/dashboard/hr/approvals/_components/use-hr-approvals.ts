"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { apiUrl } from "@/lib/api";
import type { CategorizedRequests, LeaveRequest } from "./types";

/**
 * İK izin onaylarının verisini çeker ve İK adımına (approvalOrder: 2) göre
 * bekleyen / onaylanan / reddedilen olarak kategorize eder.
 */
export function useHrApprovals() {
  const { data: session } = useSession();

  const [categorizedRequests, setCategorizedRequests] = useState<CategorizedRequests>({
    pending: [],
    approved: [],
    rejected: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAuthorized =
    (session?.user as any)?.departmentName === "İK" ||
    (session?.user as any)?.departmentName === "İnsan Kaynakları" ||
    (session?.user as any)?.role === "COMPANY_ADMIN";

  const fetchHRRequests = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(apiUrl("/api/leave-requests"));
      const data: LeaveRequest[] = await response.json();

      // Filter for requests where İK (approvalOrder: 2)
      const filtered = data.reduce(
        (acc, request) => {
          const ikApproval = request.approvals.find((a) => a.approvalOrder === 2);
          if (!ikApproval) return acc;

          const managerApproval = request.approvals.find((a) => a.approvalOrder === 1);

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
        { pending: [], approved: [], rejected: [] } as CategorizedRequests,
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

  const handleAction = async (requestId: string, action: "APPROVED" | "REJECTED") => {
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

  return {
    categorizedRequests,
    isLoading,
    actionLoading,
    isAuthorized,
    handleAction,
  };
}
