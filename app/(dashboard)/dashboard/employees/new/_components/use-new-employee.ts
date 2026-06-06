"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import * as z from "zod";
import { apiUrl } from "@/lib/api";
import { toLocalDateString } from "@/lib/status-helpers";
import { getEmployeeSchema } from "@/lib/validations/employee";
import type { DepartmentOption } from "@/lib/types";

export type EmployeeFormValues = z.infer<ReturnType<typeof getEmployeeSchema>>;

/** Yeni çalışan formunun durumunu, bölüm/şirket ayarı verisini ve kayıt akışını yönetir. */
export function useNewEmployee() {
  const router = useRouter();
  const t = useTranslations("employees");
  const tValidation = useTranslations("validation");

  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailDomain, setEmailDomain] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, settingsRes] = await Promise.all([
          fetch(apiUrl("/api/departments")),
          fetch(apiUrl("/api/company-settings")),
        ]);
        if (deptRes.ok) setDepartments(await deptRes.json());
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings?.emailDomain) setEmailDomain(settings.emailDomain);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(getEmployeeSchema(tValidation)),
    defaultValues: {
      role: "EMPLOYEE",
      workingDays: [1, 2, 3, 4, 5],
      hireDate: toLocalDateString(new Date()),
    },
  });

  const selectedWorkingDays = form.watch("workingDays") || [];

  const toggleWorkingDay = (day: number) => {
    const current = [...selectedWorkingDays];
    if (current.includes(day)) {
      form.setValue(
        "workingDays",
        current.filter((d) => d !== day),
      );
    } else {
      form.setValue("workingDays", [...current, day].sort());
    }
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl("/api/employees"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || t("addError"));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/employees`);
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("addError"));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    router,
    form,
    isLoading,
    departments,
    error,
    success,
    emailDomain,
    selectedWorkingDays,
    toggleWorkingDay,
    onSubmit,
  };
}
