"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User,
  Mail,
  Briefcase,
  Building2,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Loader2,
  Layers,
  Lock,
  Building,
  Plus,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import ErrorMessage from "@/components/error-message";

const employeeSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  role: z.enum(["COMPANY_ADMIN", "EMPLOYEE", "MANAGER"]),
  departmentId: z.string().optional(),
  position: z.string().min(2, "Pozisyon en az 2 karakter olmalıdır"),
  hireDate: z.string().min(1, "İşe giriş tarihi zorunludur"),
  workingDays: z.array(z.number()),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export default function NewEmployeePage() {
  const router = useRouter();
    
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/departments");
        if (response.ok) {
          const data = await response.json();
          setDepartments(data);
        }
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      role: "EMPLOYEE",
      workingDays: [1, 2, 3, 4, 5],
      hireDate: new Date().toISOString().split('T')[0],
    },
  });

  const selectedWorkingDays = watch("workingDays");

  const toggleWorkingDay = (day: number) => {
    const current = [...selectedWorkingDays];
    if (current.includes(day)) {
      setValue("workingDays", current.filter(d => d !== day));
    } else {
      setValue("workingDays", [...current, day].sort());
    }
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Çalışan eklenirken bir hata oluştu");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/employees`);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto mt-20 px-4">
        <Card className="shadow-none rounded-2xl border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <div className="size-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="size-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              Kayıt Başarılı!
            </h2>
            <p className="text-muted-foreground font-medium text-sm">
              Yeni çalışan sisteme başarıyla eklendi, yönlendiriliyorsunuz...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 pb-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/employees`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-1">
        <CardTitle className="text-xl mb-0.5 font-medium">
          Yeni Çalışan Ekle
        </CardTitle>
        <CardDescription>
          Şirket bünyesine yeni bir ekip üyesi dahil edin.
        </CardDescription>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Kişisel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad *</Label>
              <div className="relative">
                <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                  <User size="16" className="text-muted-foreground" />
                </span>
                <Input
                  {...register("name")}
                  id="name"
                  placeholder="Ahmet Yılmaz"
                  className="pl-8"
                />
              </div>

              {errors.name && (
                <ErrorMessage>{errors.name.message}</ErrorMessage>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta Adresi *</Label>

              <div className="relative">
                <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                  <Mail size="16" className="text-muted-foreground" />
                </span>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="ahmet.yilmaz@sertay.com"
                  className="pl-8"
                />
              </div>

              {errors.email && (
                <ErrorMessage>{errors.email.message}</ErrorMessage>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre *</Label>

              <div className="relative">
                <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                  <Lock size="16" className="text-muted-foreground" />
                </span>

                <Input
                  {...register("password")}
                  id="password"
                  type="password"
                  placeholder="******"
                  className="pl-8"
                />
              </div>

              {errors.password && (
                <ErrorMessage>{errors.password.message}</ErrorMessage>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Görev ve Yetkilendirme</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pb-4">
            <div className="space-y-2">
              <Label htmlFor="departmentId">Departman</Label>

              <div className="relative">
                <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                  <Building2 size="16" className="text-muted-foreground" />
                </span>

                <Select onValueChange={(val) => setValue("departmentId", val)}>
                  <SelectTrigger className="pl-8">
                    <SelectValue placeholder="Departman seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.departmentId && (
                <ErrorMessage>{errors.departmentId.message}</ErrorMessage>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Pozisyon / Ünvan *</Label>

              <div className="relative">
                <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                  <Layers size="16" className="text-muted-foreground" />
                </span>
                <Input
                  {...register("position")}
                  id="position"
                  placeholder="Örn: Senior Frontend Developer"
                  className="pl-8"
                />
              </div>

              {errors.position && (
                <ErrorMessage>{errors.position.message}</ErrorMessage>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role"> Sistem Rolü *</Label>

              <div className="relative">
                <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                  <Shield size="16" className="text-muted-foreground" />
                </span>

                <Select
                  defaultValue="EMPLOYEE"
                  onValueChange={(val: any) => setValue("role", val)}
                >
                  <SelectTrigger className="pl-8">
                    <SelectValue placeholder="Rol seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Standart Çalışan</SelectItem>
                    <SelectItem value="MANAGER">Yönetici</SelectItem>
                    <SelectItem value="COMPANY_ADMIN">
                      Şirket Yöneticisi
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {errors.role && (
                <ErrorMessage>{errors.role.message}</ErrorMessage>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hireDate">İşe Giriş Tarihi *</Label>
              <div className="relative">
                <DatePicker
                  date={watch("hireDate") ? new Date(watch("hireDate")) : undefined}
                  setDate={(date) => setValue("hireDate", date ? date.toISOString().split("T")[0] : "")}
                  placeholder="İşe giriş tarihi"
                />
              </div>
              {errors.hireDate && (
                <ErrorMessage>{errors.hireDate.message}</ErrorMessage>
              )}
            </div>

            <div className="md:col-span-2 space-y-3">
              <Label>Çalışma Günleri</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 1, label: "Pzt" },
                  { id: 2, label: "Sal" },
                  { id: 3, label: "Çar" },
                  { id: 4, label: "Per" },
                  { id: 5, label: "Cum" },
                  { id: 6, label: "Cmt" },
                  { id: 0, label: "Paz" },
                ].map((day) => (
                  <Button
                    key={day.id}
                    type="button"
                    variant={selectedWorkingDays.includes(day.id) ? "default" : "outline"}
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => toggleWorkingDay(day.id)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                * İzin hesaplamaları bu günler üzerinden yapılacaktır.
              </p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Hata Oluştu</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            Vazgeç
          </Button>
          <Button type="submit" size="sm" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                Kaydediliyor...
              </>
            ) : (
              <>
                <Plus />
                Çalışanı Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
