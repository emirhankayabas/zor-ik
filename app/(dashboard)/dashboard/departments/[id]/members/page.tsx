import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Users, ArrowLeft, Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import MemberManager from "./_components/member-manager";
import { getTranslations } from "next-intl/server";

export default async function ManageMembersPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("departments");
  const session = await getServerAuthSession();

  if (!session) {
    return null;
  }

  const department = await prisma.department.findUnique({
    where: {
      id,
      companyId: session.user.companyId,
    },
    include: {
      employees: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!department) {
    notFound();
  }

  // Fetch all employees in the company to allow adding them
  const allEmployees = await prisma.employee.findMany({
    where: {
      companyId: session.user.companyId,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  });

  return (
    <div className="flex flex-col gap-6 px-4 pb-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/departments/${department.id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-1">
        <CardTitle className="text-base font-bold">{t("manageMembers")}</CardTitle>
        <CardDescription>
          {t("addRemoveDesc", { name: department.name })}
        </CardDescription>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Building2 className="size-6" />
            </div>
            <div>
              <CardTitle>{t("orgUnit")}</CardTitle>
              <CardDescription>
                {t("updateOrgUnit")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MemberManager
            department={department}
            allEmployees={allEmployees}
            locale={locale}
          />
        </CardContent>
      </Card>
    </div>
  );
}
