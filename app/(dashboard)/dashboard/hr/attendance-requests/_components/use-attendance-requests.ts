"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { apiUrl } from "@/lib/api";
import type { AttendanceCorrection } from "./types";

/**
 * Puantaj düzeltme onaylarının durum yönetimi, veri çekme ve iki aşamalı
 * (yönetici → İK) onay akışına göre filtreleme mantığını kapsar.
 */
export function useAttendanceRequests() {
  const { data: session } = useSession();

  const [requests, setRequests] = useState<AttendanceCorrection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  const userId = session?.user?.id;
  const isHR =
    (session?.user as any)?.departmentName === "İK" ||
    (session?.user as any)?.departmentName === "İnsan Kaynakları" ||
    (session?.user as any)?.role === "COMPANY_ADMIN";

  const fetchRequests = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(apiUrl("/api/attendance-corrections"));
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
      const response = await fetch(`/api/attendance-corrections/${id}/approve`, {
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
      // 1. Manager Step (Order 1)
      const managerApproval = req.approvals.find((a) => a.approvalOrder === 1);
      // 2. HR Step (Order 2)
      const hrApproval = req.approvals.find((a) => a.approvalOrder === 2);

      const isMyManagerStep =
        managerApproval?.approverId === userId &&
        managerApproval?.approvalOrder === 1;
      const isMyHRStep = isHR && hrApproval?.approvalOrder === 2;

      if (tab === "pending") {
        // Manager sees pending if it is their turn
        if (isMyManagerStep && managerApproval?.status === "PENDING") {
          return true;
        }
        // HR sees pending if Manager APPROVED (or no manager step) AND it is their turn
        if (
          isMyHRStep &&
          hrApproval?.status === "PENDING" &&
          (!managerApproval || managerApproval.status === "APPROVED")
        ) {
          return true;
        }
        return false;
      }

      if (tab === "processed") {
        // Show if I processed Step 1
        if (isMyManagerStep && managerApproval?.status !== "PENDING") {
          return true;
        }
        // Show if I'm HR and Step 2 is processed
        if (isMyHRStep && hrApproval?.status !== "PENDING") {
          return true;
        }
        return false;
      }

      return false;
    });
  };

  return {
    isLoading,
    userId,
    isHR,
    actionLoading,
    rejectingId,
    setRejectingId,
    rejectComment,
    setRejectComment,
    handleAction,
    filterRequestsByTab,
  };
}
