"use client";
import { apiUrl } from "@/lib/api";

import { Building2, Users, User, MoreVertical, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Department {
  id: string;
  name: string;
  manager?: {
    name: string | null;
    email: string | null;
  } | null;
  _count: {
    employees: number;
  };
}

interface Props {
  departments: Department[];
}

export default function DepartmentList({ departments }: Props) {
  const router = useRouter();
  const t = useTranslations("departments");
  const tCommon = useTranslations("common");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(apiUrl(`/api/departments/${deleteId}`), {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(t("deleteSuccess"));
        router.refresh();
      } else {
        const result = await response.json();
        toast.error(result.error || t("deleteError"));
      }
    } catch {
      toast.error(tCommon("errorOccurred"));
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {departments.map((department) => (
          <Card key={department.id}>
            <CardHeader className="flex items-center justify-between">
              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Building2 className="size-4" />
                  </div>
                  <CardTitle>{department.name}</CardTitle>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/dashboard/departments/${department.id}/edit`}
                    >
                      {t("editSettings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/dashboard/departments/${department.id}/members`}
                    >
                      {t("manageMembers")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setDeleteId(department.id)}>
                    {t("deleteDepartment")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      <Users className="size-4" />
                    </div>
                    <span className="text-xs font-bold">{t("activeTeam")}</span>
                  </div>
                  <Badge>{department._count.employees} {tCommon("person")}</Badge>
                </div>

                <div className="p-3 border rounded-lg bg-muted/5">
                  <CardTitle className="text-xs mb-2">
                    {t("departmentManager")}
                  </CardTitle>
                  {department.manager ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                          {department.manager.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate">
                          {department.manager.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate opacity-70">
                          {department.manager.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground ">
                      <User size="14" />
                      <span className="text-xs font-medium">
                        {t("managerNotAssigned")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="mb-2 pt-3">
              <Button size="sm" asChild className="w-full">
                <Link
                  href={`/dashboard/departments/${department.id}`}
                >
                  <span>{t("detailedAnalysis")}</span>
                  <ArrowRight className="size-4 " />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon("confirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? tCommon("saving") : t("deleteDepartment")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
