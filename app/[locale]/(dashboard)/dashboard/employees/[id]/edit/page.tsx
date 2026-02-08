"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema } from "@/lib/validations/employee";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { ArrowLeft, Save, Loader2, UserCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import ErrorMessage from "@/components/error-message";

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const id = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  const form = useForm({
    resolver: zodResolver(
      employeeSchema.partial().extend({
        password: z.string().optional().or(z.literal("")),
      }),
    ),
    defaultValues: {
      name: "",
      email: "",
      position: "",
      departmentId: "",
      role: "EMPLOYEE",
      password: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, empRes] = await Promise.all([
          fetch("/api/departments"),
          fetch(`/api/employees/${id}`),
        ]);

        if (deptRes.ok) {
          const deptData = await deptRes.json();
          setDepartments(deptData);
        }

        if (empRes.ok) {
          const empData = await empRes.json();
          form.reset({
            name: empData.user.name,
            email: empData.user.email,
            position: empData.position,
            departmentId: empData.departmentId || "none",
            role: empData.user.role,
            password: "",
          });
        } else {
          toast.error("Çalışan bilgileri alınamadı");
          router.push(`/${locale}/dashboard/employees`);
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
        departmentId:
          values.departmentId === "none" ? null : values.departmentId,
      };

      if (!submitData.password) {
        delete submitData.password;
      }

      const response = await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success("Çalışan başarıyla güncellendi");
        router.push(`/${locale}/dashboard/employees`);
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
    if (
      !confirm(
        "Bu çalışanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      )
    )
      return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Çalışan başarıyla silindi");
        router.push(`/${locale}/dashboard/employees`);
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || "Silme işlemi başarısız oldu");
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
        <Button
          variant="ghost"
          asChild
          className="-ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link href={`/${locale}/dashboard/employees`}>
            <ArrowLeft className="mr-2 size-4" /> Geri Dön
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kullanıcı Düzenle
          </h1>
          <p className="text-sm text-muted-foreground">
            Çalışan bilgilerini ve sistem yetkilerini güncelleyin.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="gap-2"
        >
          {isDeleting ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Trash2 className="size-3" />
          )}
          Çalışanı Sil
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <UserCircle className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                Profil ve Görev Bilgileri
              </CardTitle>
              <CardDescription>
                Kurumsal kimlik ve departman atamaları.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Ad Soyad</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pozisyon / Unvan</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departman</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Departman Seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Atanmamış</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sistem Rolü</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Rol Seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EMPLOYEE">
                            Çalışan (Standart)
                          </SelectItem>
                          <SelectItem value="MANAGER">
                            Birim Yöneticisi
                          </SelectItem>
                          <SelectItem value="COMPANY_ADMIN">
                            İK / Şirket Yöneticisi
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yeni Şifre (Opsiyonel)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Değiştirmek için yazın"
                        />
                      </FormControl>
                      <FormDescription className="text-xs ml-2">
                        Boş bırakılırsa mevcut şifre korunur.
                      </FormDescription>
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
