"use client";

import { useState, useEffect, useCallback } from "react";

import { useSession } from "next-auth/react";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  ArrowRight,
  Info,
  Loader2,
  AlertCircle,
  User,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AttendanceCorrection {
  id: string;
  type: "ENTRY" | "EXIT" | "BOTH";
  date: string;
  entryTime: string | null;
  exitTime: string | null;
  reason: string;
  status: string;
  createdAt: string;
  employee: {
    user: {
      name: string;
      email: string;
    };
    department: {
      name: string;
    } | null;
  };
  approvals: {
    id: string;
    status: string;
    approvalOrder: number;
    approverId: string;
    approver: {
      id: string;
      name: string;
      email: string;
      role: string;
      managedDepts?: { name: string }[];
    };
  }[];
}

export default function AttendanceApprovalsPage() {
  const { data: session } = useSession();
    
  const [requests, setRequests] = useState<AttendanceCorrection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch("/api/attendance-corrections");
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none";
      case "MANAGER_APPROVED":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none";
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none";
      case "REJECTED":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-none";
      default:
        return "bg-muted text-muted-foreground border-none";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Beklemede";
      case "MANAGER_APPROVED":
        return "Yönetici Onayladı";
      case "APPROVED":
        return "Onaylandı";
      case "REJECTED":
        return "Reddedildi";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="size-3 mr-1" />;
      case "MANAGER_APPROVED":
        return <CheckCircle2 className="size-3 mr-1" />;
      case "APPROVED":
        return <CheckCircle2 className="size-3 mr-1" />;
      case "REJECTED":
        return <XCircle className="size-3 mr-1" />;
      default:
        return null;
    }
  };

  const handleAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    setActionLoading(id);
    try {
      const response = await fetch(
        `/api/attendance-corrections/${id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        },
      );

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
    const userId = session?.user?.id;
    if (!userId) return [];

    const isHR =
      (session?.user as any)?.departmentName === "İK" ||
      (session?.user as any)?.departmentName === "İnsan Kaynakları" ||
      (session?.user as any)?.role === "COMPANY_ADMIN";

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

  const RequestCard = ({ request }: { request: AttendanceCorrection }) => {
    const isProcessing = actionLoading === request.id;
    const userId = session?.user?.id;

    const isHR =
      (session?.user as any)?.departmentName === "İK" ||
      (session?.user as any)?.departmentName === "İnsan Kaynakları" ||
      (session?.user as any)?.role === "COMPANY_ADMIN";

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
      <div key={request.id}>
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
                    <span>{request.employee.department?.name || "Genel"}</span>
                    <Separator orientation="vertical" className="h-3 mt-0.5" />
                    <span>
                      {request.type === "ENTRY"
                        ? "Giriş Düzeltme"
                        : request.type === "EXIT"
                          ? "Çıkış Düzeltme"
                          : "Giriş ve Çıkış Düzeltme"}
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
                    <DropdownMenuItem>Talep Detayları</DropdownMenuItem>
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
                      <CardDescription>Talep Tarihi</CardDescription>
                      <p className="text-sm font-bold">
                        {new Date(request.date).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
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
                          <CardDescription>Yeni Giriş</CardDescription>
                          <p className="text-sm font-bold">
                            {request.entryTime}
                          </p>
                        </div>
                      </div>
                    )}
                    {request.exitTime && (
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl">
                          <Clock className="size-5" />
                        </div>
                        <div>
                          <CardDescription>Yeni Çıkış</CardDescription>
                          <p className="text-sm font-bold">
                            {request.exitTime}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Info className="size-4 text-primary mt-0.5 opacity-50" />
                  <div>
                    <CardDescription>Talep Gerekçesi</CardDescription>
                    <CardDescription className="text-foreground mt-1">
                      "{request.reason}"
                    </CardDescription>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 border-l pl-8 space-y-6">
                <div>
                  <CardTitle className="text-sm">Onay Akışı</CardTitle>
                  <div className="space-y-6 mt-4">
                    {request.approvals
                      .sort((a, b) => a.approvalOrder - b.approvalOrder)
                      .map((approval, idx) => (
                        <div
                          key={approval.id}
                          className="relative flex items-start gap-3"
                        >
                          {idx !== request.approvals.length - 1 && (
                            <div className="absolute left-3 top-7 w-px h-[calc(100%+12px)] bg-border" />
                          )}
                          <div
                            className={`mt-0.5 size-6 rounded-full border flex items-center justify-center z-10 transition-colors
                                                                    ${approval.status ===
                                "APPROVED"
                                ? "bg-emerald-500 border-emerald-500"
                                : approval.status ===
                                  "REJECTED"
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
                            <p className="text-xs font-medium">
                              {approval.approver.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase">
                              {approval.approver.managedDepts?.[0]?.name ||
                                (approval.approver.role === "COMPANY_ADMIN"
                                  ? "İK Yöneticisi"
                                  : "Birim Yöneticisi")}{" "}
                              ·{" "}
                              {approval.status === "PENDING"
                                ? "Bekliyor"
                                : "İşlendi"}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          {canApprove && (
            <CardFooter className="bg-muted/10 border-t py-3 flex justify-end gap-2 sm:px-6">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleAction(request.id, "REJECTED")}
                disabled={isProcessing}
              >
                Reddet
              </Button>
              <Button
                size="sm"
                onClick={() => handleAction(request.id, "APPROVED")}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Hemen Onayla"
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-4 pb-12">
      <div>
        <CardTitle className="text-xl font-bold">
          Giriş/Çıkış Onayları
        </CardTitle>
        <CardDescription>
          Yönetici veya İK olarak onayınızı bekleyen düzeltme talepleri.
        </CardDescription>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6 bg-muted/50">
          <TabsTrigger value="pending" className="px-8">
            Bekleyenler
          </TabsTrigger>
          <TabsTrigger value="processed" className="px-8">
            Geçmiş İşlemler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {filterRequestsByTab("pending").length === 0 ? (
              <Card className="border-dashed py-12 text-center">
                <CheckCircle2 className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Şu an onayınızı bekleyen talep bulunmuyor.
                </p>
              </Card>
            ) : (
              filterRequestsByTab("pending").map((req) => (
                <RequestCard key={req.id} request={req} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="processed">
          <div className="grid gap-4">
            {filterRequestsByTab("processed").length === 0 ? (
              <Card className="border-dashed py-12 text-center">
                <Info className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Geçmişte işlem yaptığınız bir talep bulunmuyor.
                </p>
              </Card>
            ) : (
              filterRequestsByTab("processed").map((req) => (
                <RequestCard key={req.id} request={req} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
