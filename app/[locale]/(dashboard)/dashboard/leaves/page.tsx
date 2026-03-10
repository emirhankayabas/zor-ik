"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { useSession } from "next-auth/react";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  ArrowRight,
  Info,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
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
  leaveType: {
    name: string;
  };
  approvals: {
    id: string;
    status: string;
    approvalOrder: number;
    comment: string | null;
    approver: {
      name: string;
      email: string;
      managedDepts?: { name: string }[];
    };
  }[];
}

export default function LeavesPage() {
  const { data: session } = useSession();

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch("/api/leave-requests?personal=true");
      const data = await response.json();
      setLeaveRequests(data);
    } catch (error) {
      console.error("Failed to fetch leave requests:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleDelete = async (requestId: string) => {
    if (!confirm("Bu izin talebini iptal etmek istediğinize emin misiniz?"))
      return;

    setActionLoading(requestId);
    try {
      const response = await fetch(`/api/leave-requests/${requestId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchLeaveRequests();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Silme işlemi başarısız oldu");
      }
    } catch (error) {
      console.error("Failed to delete request:", error);
      alert("Bir hata oluştu");
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


  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-4 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <CardTitle className="text-xl mb-0.5 font-medium">
            İzin Taleplerim
          </CardTitle>
          <CardDescription>
            Şahsi izin talepleriniz ve onay süreçleri takibi.
          </CardDescription>
        </div>
        <Button size="sm" asChild>
          <Link href={`/dashboard/leaves/new`}>
            <Plus className="mr-2 size-4" /> Yeni İzin Talebi
          </Link>
        </Button>
      </div>

      {leaveRequests.length === 0 ? (
        <Card className="border-dashed border">
          <CardContent className="p-24 text-center">
            <div className="size-16 bg-background rounded-2xl border flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="size-8 text-primary opacity-30" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">
              Aktif İzin Talebi Yok
            </h3>
            <CardDescription className="text-muted-foreground text-sm max-w-sm mx-auto mb-2">
              Şu an incelenmesi gereken veya geçmişe dönük bir izin kaydı
              bulunamadı.
            </CardDescription>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/leaves/new`}>
                İlk Talebi Oluştur
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {leaveRequests.map((request) => (
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
                          <span>
                            {request.employee.department?.name || "Genel"}
                          </span>
                          <Separator
                            orientation="vertical"
                            className="h-3 mt-0.5"
                          />
                          <span>{request.leaveType.name}</span>
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
                            <Link href={`/dashboard/leaves/${request.id}`}>
                              Talep Detayları
                            </Link>
                          </DropdownMenuItem>
                          {request.status === "PENDING" && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/leaves/${request.id}/edit`}>
                                  Düzenle
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(request.id)}
                              >
                                İptal Et
                              </DropdownMenuItem>
                            </>
                          )}
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
                              {new Date(request.endDate).toLocaleDateString(
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
                          {request.approvals.map((approval, idx) => (
                            <div
                              key={approval.id}
                              className="relative flex items-start gap-3"
                            >
                              {idx !== request.approvals.length - 1 && (
                                <div className="absolute left-3 top-7 w-px h-[calc(100%+12px)] bg-border" />
                              )}
                              <div
                                className={`mt-0.5 size-6 rounded-full border flex items-center justify-center z-10 transition-colors
                                            ${approval.status === "APPROVED"
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
                                <p className="text-xs font-medium">
                                  {approval.approver.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase">
                                  {approval.approver.managedDepts?.[0]?.name || (approval.approvalOrder === 1 ? "Birim Yöneticisi" : "İK Yöneticisi")} ·{" "}
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
              </Card>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/leaves/${request.id}`}>
                    Kayıt Günlüğünü İncele <ChevronDown className="size-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
