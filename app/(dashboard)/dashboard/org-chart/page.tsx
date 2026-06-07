import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Building2, Crown, Users } from "lucide-react";
import { getServerAuthSession } from "@/lib/auth";
import { canManageCompany } from "@/lib/access";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Organizasyon Şeması" };

const initials = (name?: string | null) =>
  (name || "?")
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default async function OrgChartPage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/login");
  if (!canManageCompany(session.user)) redirect("/dashboard");

  const t = await getTranslations("orgChart");
  const companyId = session.user.companyId;

  const [departments, unassigned] = await Promise.all([
    prisma.department.findMany({
      where: { companyId },
      include: {
        manager: { select: { id: true, name: true } },
        employees: {
          include: {
            user: { select: { id: true, name: true, role: true, isActive: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.employee.findMany({
      where: { companyId, departmentId: null },
      include: {
        user: { select: { id: true, name: true, role: true, isActive: true } },
      },
    }),
  ]);

  const totalEmployees =
    departments.reduce((acc, d) => acc + d.employees.length, 0) + unassigned.length;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto px-4 pb-12">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl font-medium">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="gap-1">
            <Building2 className="size-3" /> {t("departmentCount", { count: departments.length })}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Users className="size-3" /> {t("employeeCount", { count: totalEmployees })}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const managerEmployee = dept.employees.find(
            (e) => e.user.id === dept.manager?.id,
          );
          const members = dept.employees.filter(
            (e) => e.user.id !== dept.manager?.id,
          );
          return (
            <Card key={dept.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary border border-primary/20">
                    <Building2 className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{dept.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {t("memberCount", { count: dept.employees.length })}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 pb-4">
                {/* Yönetici */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary/70 mb-1.5">
                    <Crown className="size-3" /> {t("manager")}
                  </span>
                  {dept.manager ? (
                    <PersonRow
                      id={managerEmployee?.id}
                      name={dept.manager.name}
                      highlight
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("noManager")}</p>
                  )}
                </div>

                {/* Üyeler */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("members")}
                  </span>
                  {members.length > 0 ? (
                    <div className="space-y-1">
                      {members.map((e) => (
                        <PersonRow key={e.id} id={e.id} name={e.user.name} inactive={!e.user.isActive} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-1">{t("noMembers")}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Departmansız çalışanlar */}
      {unassigned.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("unassigned")}</CardTitle>
            <CardDescription>{t("unassignedDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 pb-4">
            {unassigned.map((e) => (
              <PersonRow key={e.id} id={e.id} name={e.user.name} inactive={!e.user.isActive} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PersonRow({
  id,
  name,
  highlight,
  inactive,
}: {
  id?: string;
  name?: string | null;
  highlight?: boolean;
  inactive?: boolean;
}) {
  const content = (
    <div className={`flex items-center gap-2 ${inactive ? "opacity-50" : ""}`}>
      <Avatar className="size-7">
        <AvatarFallback
          className={`text-[10px] font-bold ${highlight ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}
        >
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <span className={`text-sm truncate ${highlight ? "font-semibold" : "font-medium"}`}>
        {name || "—"}
      </span>
    </div>
  );

  if (!id) return content;
  return (
    <Link
      href={`/dashboard/employees/${id}`}
      className="block rounded-md px-1 py-0.5 hover:bg-accent/50 transition-colors"
    >
      {content}
    </Link>
  );
}
