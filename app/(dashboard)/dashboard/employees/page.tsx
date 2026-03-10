import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  Search,
  MoreHorizontal,
  Mail,
  UserPlus,
  ShieldCheck,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmployeeFilters } from "@/components/employee-filters";
import { UserRole } from "@prisma/client";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string; role?: string }>;
}) {
  const { q, dept, role } = await searchParams;
  const session = await getServerAuthSession();

  if (!session) {
    return null;
  }

  // Fetch departments for the filter dropdown
  const departments = await prisma.department.findMany({
    where: { companyId: session.user.companyId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Available roles for filtering
  const availableRoles = [UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE];

  // Build the where clause for filtering
  const where: any = {
    companyId: session.user.companyId,
  };

  if (q) {
    where.OR = [
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (dept && dept !== "all") {
    where.departmentId = dept;
  }

  if (role && role !== "all") {
    where.user = { ...where.user, role: role as UserRole };
  }

  const employees = await prisma.employee.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      department: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="flex flex-col gap-6 px-4 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <CardTitle className="text-xl mb-0.5 font-medium">
            Çalışan Listesi
          </CardTitle>
          <CardDescription>
            Sistemimizdeki tüm ekip üyeleri ve departman rolleri.
          </CardDescription>
        </div>
        <Button size="sm" asChild>
          <Link href={`/dashboard/employees/new`}>
            <UserPlus className="mr-2 size-4" /> Yeni Çalışan Ekle
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b bg-muted/30">
          <EmployeeFilters departments={departments} roles={availableRoles} />
        </CardHeader>
        <CardContent className="p-0">
          {employees.length === 0 ? (
            <div className="p-24 text-center">
              <div className="size-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="size-8 text-muted-foreground opacity-30" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Sonuç Bulunamadı
              </h3>
              <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                Filtreleme kriterlerinize uygun çalışan bulunamadı veya henüz kayıt yok.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/employees`}>
                  Tüm Listeyi Gör
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Üye</TableHead>
                  <TableHead>Departman</TableHead>
                  <TableHead>Pozisyon</TableHead>
                  <TableHead>Sistem Rolü</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee: any) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border-border shadow-none">
                          <AvatarFallback className="bg-primary/5 text-primary font-bold text-sm">
                            {employee.user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">
                            {employee.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="size-3" /> {employee.user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {employee.department?.name || "Genel"}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.position || "-"}</TableCell>
                    <TableCell>
                      {employee.user.role === "COMPANY_ADMIN" ? (
                        <Badge>
                          <ShieldCheck className="size-3 mr-1" /> Admin
                        </Badge>
                      ) : employee.user.role === "MANAGER" ? (
                        <Badge variant="secondary">Yönetici</Badge>
                      ) : (
                        <Badge variant="outline">Personel</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/employees/${employee.id}/edit`}
                            >
                              Seçileni Düzenle
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Performans Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/leaves`}
                            >
                              İzin Geçmişi
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Pasif Yap
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
