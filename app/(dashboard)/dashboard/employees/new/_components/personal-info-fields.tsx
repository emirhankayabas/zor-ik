"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { User, Mail, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ErrorMessage from "@/components/shared/error-message";
import type { EmployeeFormValues } from "./use-new-employee";

interface Props {
  form: UseFormReturn<EmployeeFormValues>;
  emailDomain: string | null;
}

export function PersonalInfoFields({ form, emailDomain }: Props) {
  const t = useTranslations("employees");
  const {
    register,
    setValue,
    formState: { errors },
  } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("personalInfo")}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pb-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("fullName")} *</Label>
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
          {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("email")} *</Label>
          <div className="relative">
            <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
              <Mail size="16" className="text-muted-foreground" />
            </span>
            <Input
              {...register("email", {
                onBlur: (e) => {
                  // Auto-append email domain if the user typed just the username part
                  if (emailDomain && e.target.value && !e.target.value.includes("@")) {
                    const fullEmail = e.target.value + emailDomain;
                    e.target.value = fullEmail;
                    setValue("email", fullEmail, { shouldValidate: true });
                  }
                },
              })}
              id="email"
              type="email"
              placeholder={emailDomain ? `ad.soyad${emailDomain}` : "ahmet.yilmaz@sirket.com"}
              className="pl-8"
            />
          </div>
          {emailDomain && (
            <p className="text-[10px] text-muted-foreground">
              {t("emailDomainHint", { domain: emailDomain })}
            </p>
          )}
          {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("password")} *</Label>
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
          {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
        </div>
      </CardContent>
    </Card>
  );
}
