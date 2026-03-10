"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Building2,
  FileText,
  Loader2,
  Check,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
  employee: {
    userId: string;
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
    description: string | null;
  };
  approvals: {
    id: string;
    status: string;
    approvalOrder: number;
    comment: string | null;
    processedAt: string | null;
    approver: {
      id: string;
      name: string;
      email: string;
      role: string;
      managedDepts?: { name: string }[];
    };
  }[];
}

export default function LeaveDetailPage() {
    const router = useRouter();
    const id = params?.id as string;

  const { data: session } = useSession();
  const [request, setRequest] = useState<LeaveRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(`/api/leave-requests`);
        const allRequests: LeaveRequest[] = await response.json();
        const detail = allRequests.find((r) => r.id === id);

        if (detail) {
          setRequest(detail);
        } else {
          // If not found in list, we could try a specific API if it exists,
          // but for now let's hope it's in the list permissions.
          // Note: Better to have GET /api/leave-requests/[id]
        }
      } catch (error) {
        console.error("Failed to fetch leave detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  const handleAction = async (action: "APPROVED" | "REJECTED") => {
    setIsProcessing(action);
    try {
      const response = await fetch(`/api/leave-requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // Refresh data
        const res = await fetch(`/api/leave-requests`);
        const all: LeaveRequest[] = await res.json();
        const updated = all.find((r) => r.id === id);
        if (updated) setRequest(updated);
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Bu izin talebini iptal etmek istediğinize emin misiniz?"))
      return;

    setIsProcessing("CANCEL");
    try {
      const response = await fetch(`/api/leave-requests/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(`/dashboard/leaves`);
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "İptal işlemi başarısız oldu");
      }
    } catch (error) {
      console.error("Cancel failed:", error);
      alert("Bir hata oluştu");
    } finally {
      setIsProcessing(null);
    }
  };

  const canApprove = () => {
    if (!session?.user?.id || !request) return false;

    // Find the current pending approval level
    const pendingApprovals = request.approvals
      .filter((a) => a.status === "PENDING")
      .sort((a, b) => a.approvalOrder - b.approvalOrder);

    if (pendingApprovals.length === 0) return false;

    // Only the first pending approval in the order can be acted upon
    const currentApproval = pendingApprovals[0];

    // Check if the current user is the approver for this step
    return (currentApproval as any).approverId === session.user.id;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-none">
            Beklemede
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-none">
            Onaylandı
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 border-none">
            Reddedildi
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 space-y-4">
        <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
          <FileText className="size-8" />
        </div>
        <h2 className="text-2xl font-bold">Kayıt Bulunamadı</h2>
        <p className="text-muted-foreground">
          Aradığınız izin talebi mevcut değil veya görüntüleme yetkiniz yok.
        </p>
        <Button onClick={() => router.back()}>Geri Dön</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          {request.status === "PENDING" &&
            request.employee.userId === session?.user?.id && (
              <>
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <Link href={`/dashboard/leaves/${id}/edit`}>
                    <Pencil className="size-3" /> Düzenle
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/5"
                  onClick={handleCancel}
                  disabled={!!isProcessing}
                >
                  {isProcessing === "CANCEL" ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Trash2 className="size-3" />
                  )}
                  Talebi İptal Et
                </Button>
              </>
            )}
          {getStatusBadge(request.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <User className="size-6" />
                </div>
                <div>
                  <CardTitle>{request.employee.user.name}</CardTitle>
                  <CardDescription>
                    {request.employee.user.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 pb-4 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <CardDescription>Departman</CardDescription>
                  <div className="flex items-center gap-2 font-medium">
                    <Building2 className="size-4 text-primary" />
                    {request.employee.department?.name || "Belirtilmemiş"}
                  </div>
                </div>
                <div className="space-y-1">
                  <CardDescription>İzin Türü</CardDescription>
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="size-4 text-primary" />
                    {request.leaveType.name}
                  </div>
                </div>
                <div className="space-y-1">
                  <CardDescription>Başlangıç Tarihi</CardDescription>
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="size-4 text-primary" />
                    {new Date(request.startDate).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="space-y-1">
                  <CardDescription>Bitiş Tarihi</CardDescription>
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="size-4 text-primary" />
                    {new Date(request.endDate).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <CardDescription>Talep Gerekçesi</CardDescription>
                <p className="">"{request.reason}"</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base mb-3">Onay Geçmişi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pb-4">
              {request.approvals.map((approval, idx) => (
                <div key={approval.id} className="relative pl-6 space-y-1">
                  {idx !== request.approvals.length - 1 && (
                    <div className="absolute left-1.75 top-4 w-px h-[calc(100%+24px)] bg-border" />
                  )}
                  <div
                    className={`absolute left-0 top-1 size-3 rounded-full border-2 bg-background z-10
                    ${approval.status === "APPROVED"
                        ? "border-emerald-500 bg-emerald-500"
                        : approval.status === "REJECTED"
                          ? "border-rose-500 bg-rose-500"
                          : "border-muted-foreground/30"
                      }`}
                  />
                  <p className="text-sm font-bold leading-none">
                    {approval.approver.name}
                  </p>
                  <CardDescription className="text-xs">
                    {approval.approver.managedDepts?.[0]?.name ||
                      (approval.approver.role === "COMPANY_ADMIN"
                        ? "İK Yöneticisi"
                        : "Birim Yöneticisi")}
                  </CardDescription>
                  <CardDescription className="text-xs font-medium">
                    {approval.status === "PENDING" ? (
                      <span className="text-amber-600">Beklemede</span>
                    ) : approval.status === "APPROVED" ? (
                      <span className="text-emerald-600">Onayladı</span>
                    ) : (
                      <span className="text-rose-600">Reddetti</span>
                    )}
                  </CardDescription>
                </div>
              ))}
            </CardContent>
            {request.status === "PENDING" && canApprove() && (
              <CardFooter className="flex flex-col gap-2 border-t pt-4 pb-3">
                <Button
                  className="w-full gap-2"
                  onClick={() => handleAction("APPROVED")}
                  disabled={!!isProcessing}
                >
                  {isProcessing === "APPROVED" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  Onayla
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => handleAction("REJECTED")}
                  disabled={!!isProcessing}
                >
                  {isProcessing === "REJECTED" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <X className="size-4" />
                  )}
                  Reddet
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
