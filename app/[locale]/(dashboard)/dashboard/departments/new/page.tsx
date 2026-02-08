"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Building2,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Layers,
  Building,
  Plus,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import ErrorMessage from "@/components/error-message";

const departmentSchema = z.object({
  name: z.string().min(2, "Departman adı en az 2 karakter olmalıdır"),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

export default function NewDepartmentPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
  });

  const onSubmit = async (data: DepartmentFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(
          result.error || "Departman oluşturulurken bir hata oluştu",
        );
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/dashboard/departments`);
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
      <div className="max-w-xl mx-auto mt-20">
        <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-none rounded-2xl">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <div className="size-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="size-8" />
            </div>
            <h2 className="text-2xl font-black text-foreground">
              Departman Hazır!
            </h2>
            <p className="text-muted-foreground font-medium">
              Yeni birim başarıyla tanımlandı, yönlendiriliyorsunuz...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 px-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${locale}/dashboard/departments`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-1">
        <CardTitle className="text-xl mb-0.5 font-medium">
          Yeni Departman
        </CardTitle>
        <CardDescription>
          Şirket hiyerarşisine yeni bir organizasyon birimi ekleyin.
        </CardDescription>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Departman Adı *</Label>
              <div className="relative">
                <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                  <Building size="16" className="text-muted-foreground" />
                </span>

                <Input
                  {...register("name")}
                  id="name"
                  placeholder="Örn: Yazılım Geliştirme, İnsan Kaynakları..."
                  className="pl-8"
                />
              </div>
              {errors.name && (
                <ErrorMessage>{errors.name.message}</ErrorMessage>
              )}
            </div>

            <div className="py-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Yeni bir departman oluşturduğunuzda, çalışanları bu birime
                atayabilir ve bir departman yöneticisi belirleyebilirsiniz.
              </p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertTitle className="font-bold">Hata Oluştu</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-4 pt-2">
          <Button variant="outline" onClick={() => router.back()}>
            Vazgeç
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Departmanı Oluştur
          </Button>
        </div>
      </form>
    </div>
  );
}
