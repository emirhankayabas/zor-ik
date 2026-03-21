import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};

export default async function EmployeeLeavesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerAuthSession();
  if (!session) return null;

  const employee = await prisma.employee.findUnique({
    where: { id, companyId: session.user.companyId },
    include: {
      user: { select: { name: true, email: true } },
      leaveRequests: {
        include: { leaveType: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!employee) notFound();

  const fmt = (date: Date) =>
    format(date, "d MMM yyyy", { locale: tr });

  return (
    <div className="flex flex-col gap-6 px-4 pb-12">
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link href="/dashboard/employees">
            <ArrowLeft className="mr-2 size-4" /> Çalışanlara Dön
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {employee.user.name} — İzin Geçmişi
          </h1>
          <p className="text-sm text-muted-foreground">{employee.user.email}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          Kalan İzin: <span className="font-bold text-foreground">{employee.totalLeftLeaveDays} gün</span>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b bg-muted/30">
          <CardTitle className="text-sm font-medium">
            Tüm İzin Talepleri ({employee.leaveRequests.length})
          </CardTitle>
          <CardDescription>
            Bu çalışanın geçmiş ve aktif izin talepleri
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {employee.leaveRequests.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground text-sm">
              Henüz izin talebi bulunmuyor.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İzin Türü</TableHead>
                  <TableHead>Başlangıç</TableHead>
                  <TableHead>Bitiş</TableHead>
                  <TableHead>Gün</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Talep Tarihi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.leaveRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">
                      {req.leaveType.name}
                    </TableCell>
                    <TableCell>{fmt(req.startDate)}</TableCell>
                    <TableCell>{fmt(req.endDate)}</TableCell>
                    <TableCell>{req.actualDays > 0 ? req.actualDays : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[req.status] ?? "outline"}>
                        {STATUS_LABELS[req.status] ?? req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {fmt(req.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
