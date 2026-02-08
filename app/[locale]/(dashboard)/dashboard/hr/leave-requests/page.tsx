"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  actualDays: number;
  reason: string;
  status: string;
  createdAt: string;
  leaveType: {
    name: string;
  };
  employee: {
    totalLeftLeaveDays: number;
    annualLeaveQuota: number;
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

export default function LeaveApprovalsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const locale = params?.locale || "tr";

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch("/api/leave-requests");
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

  const handleAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/leave-requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none";
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
      case "APPROVED":
        return <CheckCircle2 className="size-3 mr-1" />;
      case "REJECTED":
        return <XCircle className="size-3 mr-1" />;
      default:
        return null;
    }
  };

  const filterRequestsByTab = (tab: string) => {
    const userId = session?.user?.id;
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

  const RequestCard = ({ request }: { request: LeaveRequest }) => {
    const isProcessing = actionLoading === request.id;
    const userId = session?.user?.id;
    const myApproval = request.approvals.find((a) => a.approverId === userId);

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
                    <div className="flex items-center gap-2">
                      <span>{request.leaveType.name}</span>
                      {request.leaveType.name === "Yıllık İzin" && request.actualDays > (request.employee.totalLeftLeaveDays || 0) && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4 bg-rose-50 text-rose-600 border-rose-200">
                          Avans İzin
                        </Badge>
                      )}
                    </div>
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
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/dashboard/leaves/${request.id}`}>
                        Talep Detayları
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
                      <CardDescription>Başlangıç</CardDescription>
                      <p className="text-sm font-bold">
                        {new Date(request.startDate).toLocaleDateString(
                          "tr-TR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-foreground hidden sm:block opacity-30" />
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                      <CalendarIcon className="size-5" />
                    </div>
                    <div>
                      <CardDescription>Bitiş</CardDescription>
                      <p className="text-sm font-bold">
                        {new Date(request.endDate).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
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
          {myApproval?.status === "PENDING" && (
            <CardFooter className="bg-muted/10 border-t py-3 flex justify-end items-center sm:px-6">
              <div className="flex gap-2">
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
              </div>
            </CardFooter>
          )}
        </Card>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${locale}/dashboard/leaves/${request.id}`}>
              Kayıt Günlüğünü İncele <ChevronDown className="size-3" />
            </Link>
          </Button>
        </div>
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
        <CardTitle className="text-xl font-bold">İzin Onayları</CardTitle>
        <CardDescription>
          Yönetici veya İK olarak onayınızı bekleyen personel izin talepleri.
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
