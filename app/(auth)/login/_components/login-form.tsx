"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getLoginSchema, type LoginInput } from "@/lib/validations/auth";
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
import ErrorMessage from "@/components/shared/error-message";

export default function LoginForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(getLoginSchema(tValidation)),
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
        setError(t("loginError"));
        return;
      }

      router.push(`/dashboard`);
      router.refresh();
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
          <CardTitle>{t("welcomeBack")}</CardTitle>
          <CardDescription>
            {t("loginSubtitle")}
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

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="relative">
                <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
                  <Mail size="16" className="text-muted-foreground" />
                </span>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder={t("email")}
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
                <Label htmlFor="password">{t("password")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline mr-2"
                >
                  {t("forgotPassword")}
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
                  {t("loggingIn")}
                </>
              ) : (
                t("login")
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col py-3! border-t">
          <p className="text-sm text-center text-muted-foreground">
            {t("noAccount")}{" "}
            <Link
              href="/register"
              className="font-bold text-primary hover:underline"
            >
              {t("registerNow")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
