"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ErrorMessage from "@/components/error-message";

interface Props {
  locale: string;
}

export default function Content({ locale }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("E-posta veya şifre hatalı");
        return;
      }

      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 bg-muted/30">
      <Card className="w-full max-w-md border-border/50 shadow-xl overflow-hidden backdrop-blur-sm bg-background/95">
        <CardHeader className="pb-6 gap-0.5!">
          <CardTitle>Tekrar Hoş Geldiniz</CardTitle>
          <CardDescription>
            Lütfen devam etmek için hesabınıza giriş yapın
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert
                variant="destructive"
                className="animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Hata</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <div className="relative">
                <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                  <Mail size="16" className="text-muted-foreground" />
                </span>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="ornek@sirket.com"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <ErrorMessage>{errors.email.message}</ErrorMessage>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Şifre</Label>
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-xs text-primary hover:underline mr-2"
                >
                  Şifremi Unuttum
                </Link>
              </div>
              <div className="relative">
                <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                  <Lock size="16" className="text-muted-foreground" />
                </span>
                <Input
                  {...register("password")}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <ErrorMessage>{errors.password.message}</ErrorMessage>
              )}
            </div>

            <Button
              type="submit"
              className="w-full font-semibold transition-all mb-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col py-3! border-t">
          <p className="text-sm text-center text-muted-foreground">
            Hesabınız yok mu?{" "}
            <Link
              href={`/${locale}/register`}
              className="font-bold text-primary hover:underline"
            >
              Hemen Kayıt Olun
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
