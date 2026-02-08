import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  Building2,
  Users,
  User as UserIcon,
  ArrowLeft,
  Mail,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
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
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      employees: {
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
      },
      _count: {
        select: {
          employees: true,
        },
      },
    },
  });

  if (!department) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8 px-4 pb-12 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href={`/${locale}/dashboard/departments`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link
              href={`/${locale}/dashboard/departments/${department.id}/edit`}
            >
              Ayarları Düzenle
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link
              href={`/${locale}/dashboard/departments/${department.id}/members`}
            >
              Üyeleri Yönet
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <CardTitle>{department.name}</CardTitle>
                  <CardDescription>Departman Özeti</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-dashed">
                  <span className="text-xs font-medium text-muted-foreground">
                    Toplam Üye
                  </span>
                  <Badge className="bg-muted text-foreground hover:bg-muted font-black text-[10px]">
                    {department._count.employees} Kişi
                  </Badge>
                </div>

                <div className="space-y-2 pt-2 pb-4">
                  <CardDescription className="text-white">
                    Departman Yöneticisi
                  </CardDescription>
                  {department.manager ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8 shadow-sm">
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                          {department.manager.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <CardTitle className="text-xs font-bold truncate">
                          {department.manager.name}
                        </CardTitle>
                        <CardDescription>
                          {department.manager.email}
                        </CardDescription>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-x-2">
                      <UserIcon className="size-4 text-muted-foreground" />
                      <CardDescription>Yönetici Atanmamış</CardDescription>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="border-b bg-muted/30 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Users className="size-5" />
                </div>
                <div>
                  <CardTitle>Departman Üyeleri</CardTitle>
                  <CardDescription>
                    Bu departmanda görev yapan personel listesi.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {department.employees.length === 0 ? (
                <div className="p-20 text-center">
                  <p className="text-muted-foreground text-sm font-medium">
                    Bu departmanda henüz kayıtlı çalışan bulunmuyor.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {department.employees.map((employee: any) => (
                    <div
                      key={employee.id}
                      className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="size-10 border-background shadow-sm">
                          <AvatarFallback className="bg-muted text-foreground text-sm uppercase">
                            {employee.user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm group-hover:text-primary transition-colors">
                            {employee.user.name}
                            {employee.user.id === department.managerId && (
                              <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/20 border-none font-black text-[8px] uppercase tracking-tighter align-middle">
                                Yönetici
                              </Badge>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1 opacity-60 text-xs">
                            <div className="flex items-center gap-1.5">
                              <Briefcase size={12} />
                              {employee.position || "Pozisyon Belirtilmemiş"}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Mail size={12} />
                              {employee.user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Link
                          href={`/${locale}/dashboard/employees/${employee.id}`}
                        >
                          <ExternalLink size={16} />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
