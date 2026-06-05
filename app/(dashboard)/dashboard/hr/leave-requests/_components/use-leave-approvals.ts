"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { apiUrl } from "@/lib/api";
import type { LeaveRequest } from "./types";

/**
 * Yöneticinin (approvalOrder: 1) izin taleplerini çeker ve bekleyen / işlenmiş
 * sekmelerine göre filtreler.
 */
export function useLeaveApprovals() {
  const { data: session } = useSession();

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  const userId = session?.user?.id;

  const fetchRequests = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(apiUrl("/api/leave-requests"));
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (
    id: string,
    action: "APPROVED" | "REJECTED",
    comment?: string,
  ) => {
    setActionLoading(id);
    try {
      const response = await fetch(apiUrl(`/api/leave-requests/${id}/approve`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment }),
      });

      if (response.ok) {
        await fetchRequests();
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const filterRequestsByTab = (tab: string) => {
    if (!userId) return [];

    return requests.filter((req) => {
      const myApproval = req.approvals.find(
        (a) => a.approverId === userId && a.approvalOrder === 1,
      );
      if (!myApproval) return false;

      if (tab === "pending") {
        return myApproval.status === "PENDING";
      }

      if (tab === "processed") {
        return myApproval.status !== "PENDING";
      }

      return false;
    });
  };

  return {
    isLoading,
    userId,
    actionLoading,
    rejectingId,
    setRejectingId,
    rejectComment,
    setRejectComment,
    handleAction,
    filterRequestsByTab,
  };
}
