"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { apiUrl } from "@/lib/api";
import { getRegisterSchema, type RegisterInput } from "@/lib/validations/auth";
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
import { Mail, Lock, User, Building, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ErrorMessage from "@/components/shared/error-message";

export default function RegisterForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(getRegisterSchema(tValidation)),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || t("registerError"));
        return;
      }

      router.push(`/login?registered=true`);
    } catch {
      setError(t("genericError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 bg-muted/30">
      <Card className="w-full max-w-md border-border/50 shadow-xl overflow-hidden backdrop-blur-sm bg-background/95">
        <CardHeader className="pb-6 gap-0.5!">
          <CardTitle>{t("getStarted")}</CardTitle>
          <CardDescription>
            {t("registerSubtitle")}
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
                <AlertTitle>{tCommon("error")}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">{t("companyName")}</Label>
                <div className="relative">
                  <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                    <Building size="16" className="text-muted-foreground" />
                  </span>
                  <Input
                    {...formRegister("companyName")}
                    id="companyName"
                    placeholder={t("companyName")}
                    className="pl-8"
                    disabled={isLoading}
                  />
                </div>
                {errors.companyName && (
                  <ErrorMessage>{errors.companyName.message}</ErrorMessage>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{t("fullName")}</Label>
                <div className="relative">
                  <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                    <User size="16" className="text-muted-foreground" />
                  </span>
                  <Input
                    {...formRegister("name")}
                    id="name"
                    placeholder={t("fullName")}
                    className="pl-8"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <ErrorMessage>{errors.name.message}</ErrorMessage>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("corporateEmail")}</Label>
                <div className="relative">
                  <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                    <Mail size="16" className="text-muted-foreground" />
                  </span>
                  <Input
                    {...formRegister("email")}
                    id="email"
                    type="email"
                    placeholder={t("email")}
                    className="pl-8"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <ErrorMessage>{errors.email.message}</ErrorMessage>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                    <Lock size="16" className="text-muted-foreground" />
                  </span>
                  <Input
                    {...formRegister("password")}
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-8"
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <ErrorMessage>{errors.password.message}</ErrorMessage>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <div className="relative">
                  <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                    <Lock size="16" className="text-muted-foreground" />
                  </span>
                  <Input
                    {...formRegister("confirmPassword")}
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-8"
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && (
                  <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full font-semibold transition-all mb-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("creatingAccount")}
                </>
              ) : (
                t("createAccount")
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col py-3! border-t">
          <p className="text-sm text-center text-muted-foreground">
            {t("hasAccount")}{" "}
            <Link
              href="/login"
              className="font-bold text-primary hover:underline"
            >
              {t("loginLink")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
