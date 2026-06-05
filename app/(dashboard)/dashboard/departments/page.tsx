import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Plus, Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DepartmentList from "./_components/department-list";
import { getTranslations } from "next-intl/server";

export default async function DepartmentsPage({
}: {
}) {
  const t = await getTranslations("departments");
  const session = await getServerAuthSession();

  if (!session) {
    return null;
  }

  const departments = await prisma.department.findMany({
    where: {
      companyId: session.user.companyId,
    },
    include: {
      manager: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          employees: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="flex flex-col px-4 pb-12">
      <div className="flex itemscenter justify-between mb-4">
        <div>
          <CardTitle className="text-xl mb-0.5 font-medium">
            {t("title")}
          </CardTitle>
          <CardDescription>
            {t("subtitle")}
          </CardDescription>
        </div>
        <Button asChild>
          <Link href={`/dashboard/departments/new`}>
            <Plus className="size-4" /> {t("createNew")}
          </Link>
        </Button>
      </div>

      {departments.length === 0 ? (
        <Card>
          <CardContent className="py-16 gap-y-3 flex flex-col items-center justify-center">
            <Layers size="32" />
            <CardDescription>
              {t("emptyDesc")}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <DepartmentList departments={departments} />
      )}
    </div>
  );
}
