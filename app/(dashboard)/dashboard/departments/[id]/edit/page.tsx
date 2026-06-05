"use client";
import { apiUrl } from "@/lib/api";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDepartmentSchema } from "@/lib/validations/employee";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, Building2, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useConfirm } from "@/components/shared/confirm-dialog";

export default function EditDepartmentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = use(params);
  const router = useRouter();
  const t = useTranslations("departments");
  const confirm = useConfirm();
  const tCommon = useTranslations("common");
  const tv = useTranslations("validation");
  const tRoles = useTranslations("roles");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [managers, setManagers] = useState<any[]>([]);

  const form = useForm({
    resolver: zodResolver(getDepartmentSchema(tv)),
    defaultValues: {
      name: "",
      managerId: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch potential managers (users)
        const usersRes = await fetch(apiUrl("/api/employees"));
        if (usersRes.ok) {
          const employees = await usersRes.json();
          // Map and filter employees by role for manager selection
          const managerList = employees
            .filter((emp: any) => emp.user.role === 'COMPANY_ADMIN' || emp.user.role === 'MANAGER')
            .map((emp: any) => ({
              id: emp.user.id,
              name: emp.user.name,
              role: emp.user.role,
            }));
          setManagers(managerList);
        }

        // Fetch department data
        const deptRes = await fetch(apiUrl(`/api/departments/${id}`));
        if (deptRes.ok) {
          const deptData = await deptRes.json();
          form.reset({
            name: deptData.name,
            managerId: deptData.managerId || "none",
          });
        } else {
          toast.error(t("dataLoadError"));
          router.push(`/dashboard/departments`);
        }
      } catch (err) {
        console.error("Data fetch error:", err);
        toast.error(tCommon("errorOccurred"));
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, locale, router, form]);

  const onSubmit = async (values: any) => {
    setIsSaving(true);
    try {
      const submitData = {
        ...values,
        managerId: values.managerId === "none" ? null : values.managerId,
      };

      const response = await fetch(apiUrl(`/api/departments/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(t("updateSuccess"));
        router.push(`/dashboard/departments`);
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || t("updateError"));
      }
    } catch (err) {
      toast.error(tCommon("connectionError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      description: tCommon("confirm"),
      destructive: true,
    });
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(apiUrl(`/api/departments/${id}`), {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(t("deleteSuccess"));
        router.push(`/dashboard/departments`);
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(
          data.error || t("deleteError")
        );
      }
    } catch (err) {
      toast.error(tCommon("connectionError"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/departments`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold">{t("editTitle")}</CardTitle>
          <CardDescription>
            {t("editSubtitle")}
          </CardDescription>
        </div>

        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          {t("deleteDepartment")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <Building2 className="size-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">
                {t("configTitle")}
              </CardTitle>
              <CardDescription>
                {t("configSubtitle")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }: { field: any }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>{t("nameLabel")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="managerId"
                  render={({ field }: { field: any }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>{t("managerSelect")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("managerSelectPlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">{tCommon("unassigned")}</SelectItem>
                          {managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name} ({manager.role === 'COMPANY_ADMIN' ? tRoles("hrManager") : tRoles("unitManager")})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pb-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {tCommon("saveChanges")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
