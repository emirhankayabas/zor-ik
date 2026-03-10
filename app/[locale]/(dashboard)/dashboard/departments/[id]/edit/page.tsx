"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { departmentSchema } from "@/lib/validations/employee";
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

export default function EditDepartmentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [managers, setManagers] = useState<any[]>([]);

  const form = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      managerId: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch potential managers (users)
        const usersRes = await fetch("/api/employees");
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
        const deptRes = await fetch(`/api/departments/${id}`);
        if (deptRes.ok) {
          const deptData = await deptRes.json();
          form.reset({
            name: deptData.name,
            managerId: deptData.managerId || "none",
          });
        } else {
          toast.error("Departman bilgileri alınamadı");
          router.push(`/dashboard/departments`);
        }
      } catch (err) {
        console.error("Data fetch error:", err);
        toast.error("Veri yüklenirken bir hata oluştu");
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

      const response = await fetch(`/api/departments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success("Departman başarıyla güncellendi");
        router.push(`/dashboard/departments`);
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || "Güncelleme sırasında bir hata oluştu");
      }
    } catch (err) {
      toast.error("Bağlantı hatası oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu departmanı silmek istediğinize emin misiniz?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Departman başarıyla silindi");
        router.push(`/dashboard/departments`);
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(
          data.error ||
          "Silme işlemi başarısız oldu. Departmana bağlı çalışanlar olabilir.",
        );
      }
    } catch (err) {
      toast.error("Bağlantı hatası oluştu");
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
          <CardTitle className="text-lg font-bold">Departman Düzenle</CardTitle>
          <CardDescription>
            Organizasyonel birim detaylarını güncelleyin.
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
          Departmanı Sil
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
                Birim Yapılandırması
              </CardTitle>
              <CardDescription>
                Departman adı ve sorumlu yönetici ataması.
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
                      <FormLabel>Departman Adı</FormLabel>
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
                      <FormLabel>Sorumlu Yönetici</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Yönetici Seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Atanmamış</SelectItem>
                          {managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name} ({manager.role === 'COMPANY_ADMIN' ? 'İK Yöneticisi' : 'Birim Yöneticisi'})
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
                  Değişiklikleri Kaydet
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
