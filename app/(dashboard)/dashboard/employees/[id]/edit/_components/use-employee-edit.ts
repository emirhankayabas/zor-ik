"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api";
import { getEmployeeSchema } from "@/lib/validations/employee";
import type { DepartmentOption, ShiftOption } from "@/lib/types";

/** Çalışan düzenleme formunun verisini yükler ve kaydetme/silme işlemlerini yönetir. */
export function useEmployeeEdit(id: string) {
  const router = useRouter();
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [shifts, setShifts] = useState<ShiftOption[]>([]);
  const [selectedWorkingDays, setSelectedWorkingDays] = useState<number[]>([
    1, 2, 3, 4, 5,
  ]);
  const [selectedShiftId, setSelectedShiftId] = useState<string>("");

  const form = useForm({
    resolver: zodResolver(
      getEmployeeSchema(tValidation).partial().extend({
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
        const [deptRes, empRes, shiftRes] = await Promise.all([
          fetch(apiUrl("/api/departments")),
          fetch(apiUrl(`/api/employees/${id}`)),
          fetch(apiUrl("/api/shifts")),
        ]);

        if (deptRes.ok) setDepartments(await deptRes.json());
        if (shiftRes.ok) setShifts(await shiftRes.json());

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
          setSelectedShiftId(empData.shiftId || "");
          setSelectedWorkingDays(empData.workingDays || [1, 2, 3, 4, 5]);
        } else {
          toast.error(t("fetchError"));
          router.push("/dashboard/employees");
        }
      } catch (err) {
        console.error("Data fetch error:", err);
        toast.error(t("dataLoadError"));
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router, form]);

  const toggleWorkingDay = (day: number) => {
    setSelectedWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  };

  const onSubmit = async (values: FieldValues) => {
    setIsSaving(true);
    try {
      const { password, ...restValues } = values;
      const submitData: FieldValues = {
        ...restValues,
        departmentId: values.departmentId === "none" ? null : values.departmentId,
        shiftId: selectedShiftId || null,
        workingDays: selectedWorkingDays,
      };

      if (password) submitData.password = password;

      const response = await fetch(apiUrl(`/api/employees/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(t("updatedSuccess"));
        router.push("/dashboard/employees");
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
    if (!confirm(t("deleteConfirm"))) return;

    setIsDeleting(true);
    try {
      const response = await fetch(apiUrl(`/api/employees/${id}`), {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(t("deletedSuccess"));
        router.push("/dashboard/employees");
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || t("deleteError"));
      }
    } catch (err) {
      toast.error(tCommon("connectionError"));
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    form,
    isLoading,
    isSaving,
    isDeleting,
    departments,
    shifts,
    selectedShiftId,
    setSelectedShiftId,
    selectedWorkingDays,
    toggleWorkingDay,
    onSubmit,
    handleDelete,
  };
}
