import { getServerAuthSession } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
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
import { Button } from "@/components/ui/button";
import { EmployeeActionsMenu } from "./_components/employee-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmployeeFilters } from "./_components/employee-filters";
import { UserRole, Prisma } from "@prisma/client";

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

  const t = await getTranslations("employees");
  const tCommon = await getTranslations("common");
  const tRoles = await getTranslations("roles");

  // Fetch departments for the filter dropdown
  const departments = await prisma.department.findMany({
    where: { companyId: session.user.companyId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Available roles for filtering
  const availableRoles = [UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE];

  // Build the where clause for filtering
  const where: Prisma.EmployeeWhereInput = {
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
    where.user = { role: role as UserRole };
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
          isActive: true,
        },
      },
      department: {
        select: {
          name: true,
        },
      },
      shift: {
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
            {t("title")}
          </CardTitle>
          <CardDescription>
            {t("subtitle")}
          </CardDescription>
        </div>
        <Button size="sm" asChild>
          <Link href={`/dashboard/employees/new`}>
            <UserPlus className="mr-2 size-4" /> {t("addNew")}
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
                {tCommon("noResults")}
              </h3>
              <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                {t("noResultsDesc")}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/employees`}>
                  {t("showAll")}
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("member")}</TableHead>
                  <TableHead>{t("department")}</TableHead>
                  <TableHead>{t("position")}</TableHead>
                  <TableHead>{t("shift")}</TableHead>
                  <TableHead>{t("systemRole")}</TableHead>
                  <TableHead className="text-right">{tCommon("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id} className={!employee.user.isActive ? "opacity-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border-border shadow-none">
                          <AvatarFallback className="bg-primary/5 text-primary font-bold text-sm">
                            {employee.user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">
                              {employee.user.name}
                            </span>
                            {!employee.user.isActive && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 border-destructive/40 text-destructive">
                                Pasif
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="size-3" /> {employee.user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {employee.department?.name || tCommon("general")}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.position || "-"}</TableCell>
                    <TableCell>
                      {employee.shift ? (
                        <Badge variant="outline">{employee.shift.name}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.user.role === "COMPANY_ADMIN" ? (
                        <Badge>
                          <ShieldCheck className="size-3 mr-1" /> {tRoles("admin")}
                        </Badge>
                      ) : employee.user.role === "MANAGER" ? (
                        <Badge variant="secondary">{tRoles("manager")}</Badge>
                      ) : (
                        <Badge variant="outline">{tRoles("employee")}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <EmployeeActionsMenu
                        employeeId={employee.id}
                        isActive={employee.user.isActive}
                      />
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
