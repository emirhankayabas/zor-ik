"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Info,
  Loader2,
  AlertCircle,
  ArrowRight,
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceCorrection {
  id: string;
  type: "ENTRY" | "EXIT" | "BOTH";
  date: string;
  entryTime: string | null;
  exitTime: string | null;
  reason: string;
  status: string;
  createdAt: string;
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

export default function AttendancePage() {

  const [requests, setRequests] = useState<AttendanceCorrection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/attendance-corrections?personal=true");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm("Bu düzeltme talebini iptal etmek istediğinize emin misiniz?"))
      return;

    setActionLoading(requestId);
    try {
      const response = await fetch(`/api/attendance-corrections/${requestId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchRequests();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "İşlem başarısız oldu");
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-4 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <CardTitle className="text-xl mb-0.5 font-medium">
            Giriş/Çıkış Düzeltme Taleplerim
          </CardTitle>
          <CardDescription>
            Unutulan veya hatalı kart işlemleriniz için oluşturduğunuz talepler.
          </CardDescription>
        </div>
        <Button size="sm" asChild>
          <Link href={`/dashboard/attendance/new`}>
            <Plus className="mr-2 size-4" /> Yeni Talep Oluştur
          </Link>
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-24 text-center">
            <div className="size-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="size-8 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-xl font-bold mb-2">Talep Bulunmuyor</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
              Henüz bir giriş/çıkış düzeltme talebi oluşturmadınız.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/attendance/new`}>
                İlk Talebi Oluştur
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div key={request.id}>
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                        <Clock className="size-5" />
                      </div>
                      <div className="space-y-0.5">
                        <CardTitle>
                          {new Date(request.date).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {request.type === "ENTRY"
                            ? "Giriş Düzeltme"
                            : request.type === "EXIT"
                              ? "Çıkış Düzeltme"
                              : "Giriş ve Çıkış Düzeltme"}
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
                          {request.status === "PENDING" ? (
                            <DropdownMenuItem
                              className="text-rose-600 focus:text-rose-600"
                              disabled={actionLoading === request.id}
                              onClick={() => handleDelete(request.id)}
                            >
                              {actionLoading === request.id ? (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              ) : null}
                              Talebi İptal Et
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem disabled className="text-muted-foreground text-xs italic">
                              Hakkında işlem yapılmış talepler iptal edilemez
                            </DropdownMenuItem>
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
                        {request.entryTime && (
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                              <Clock className="size-5" />
                            </div>
                            <div>
                              <CardDescription>Giriş Saati</CardDescription>
                              <p className="text-sm font-bold">
                                {request.entryTime}
                              </p>
                            </div>
                          </div>
                        )}
                        {request.entryTime && request.exitTime && (
                          <ArrowRight className="size-4 text-foreground hidden sm:block opacity-30" />
                        )}
                        {request.exitTime && (
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl">
                              <Clock className="size-5" />
                            </div>
                            <div>
                              <CardDescription>Çıkış Saati</CardDescription>
                              <p className="text-sm font-bold">
                                {request.exitTime}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-start gap-4">
                        <Info className="size-4 text-primary mt-0.5 opacity-50" />
                        <div>
                          <CardDescription>Talep Gerekçesi</CardDescription>
                          <CardDescription className="text-foreground mt-1 text-sm">
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
                                    {approval.approver.managedDepts?.[0]
                                      ?.name ||
                                      (approval.approver.role ===
                                        "COMPANY_ADMIN"
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
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
