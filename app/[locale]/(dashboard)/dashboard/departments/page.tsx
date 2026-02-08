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
import DepartmentList from "./Component/DepartmentList";

export default async function DepartmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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
            Departman Yapısı
          </CardTitle>
          <CardDescription>
            Organizasyonel birimler ve hiyerarşik yönetim paneli.
          </CardDescription>
        </div>
        <Button asChild>
          <Link href={`/${locale}/dashboard/departments/new`}>
            <Plus className="size-4" /> Yeni Departman Oluştur
          </Link>
        </Button>
      </div>

      {departments.length === 0 ? (
        <Card>
          <CardContent className="py-16 gap-y-3 flex flex-col items-center justify-center">
            <Layers size="32" />
            <CardDescription>
              Şirket yapınızı oluşturmak için ilk departmanı şimdi ekleyin.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <DepartmentList departments={departments} locale={locale} />
      )}
    </div>
  );
}
