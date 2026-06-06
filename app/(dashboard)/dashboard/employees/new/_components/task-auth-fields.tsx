"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Building2, Layers, Shield } from "lucide-react";
import {
  Card,
  CardContent,
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
import { DatePicker } from "@/components/ui/date-picker";
import ErrorMessage from "@/components/shared/error-message";
import { toLocalDateString } from "@/lib/status-helpers";
import type { EmployeeFormValues } from "./use-new-employee";
import type { DepartmentOption } from "@/lib/types";

interface Props {
  form: UseFormReturn<EmployeeFormValues>;
  departments: DepartmentOption[];
  selectedWorkingDays: number[];
  toggleWorkingDay: (day: number) => void;
}

export function TaskAuthFields({
  form,
  departments,
  selectedWorkingDays,
  toggleWorkingDay,
}: Props) {
  const t = useTranslations("employees");
  const tWeekdays = useTranslations("weekdays");
  const tRoles = useTranslations("roles");
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const weekdays = [
    { id: 1, label: tWeekdays("mon") },
    { id: 2, label: tWeekdays("tue") },
    { id: 3, label: tWeekdays("wed") },
    { id: 4, label: tWeekdays("thu") },
    { id: 5, label: tWeekdays("fri") },
    { id: 6, label: tWeekdays("sat") },
    { id: 0, label: tWeekdays("sun") },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("taskAndAuth")}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pb-4">
        <div className="space-y-2">
          <Label htmlFor="departmentId">{t("department")}</Label>
          <div className="relative">
            <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
              <Building2 size="16" className="text-muted-foreground" />
            </span>
            <Select onValueChange={(val) => setValue("departmentId", val)}>
              <SelectTrigger className="pl-8">
                <SelectValue placeholder={t("selectDepartment")} />
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
          <Label htmlFor="position">{t("positionTitle")} *</Label>
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
          {errors.position && <ErrorMessage>{errors.position.message}</ErrorMessage>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role"> {t("systemRole")} *</Label>
          <div className="relative">
            <span className="w-9 h-9 flex items-center justify-center absolute left-0 top-0">
              <Shield size="16" className="text-muted-foreground" />
            </span>
            <Select
              defaultValue="EMPLOYEE"
              onValueChange={(val) => setValue("role", val as EmployeeFormValues["role"])}
            >
              <SelectTrigger className="pl-8">
                <SelectValue placeholder={t("selectRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMPLOYEE">{tRoles("employee")}</SelectItem>
                <SelectItem value="MANAGER">{tRoles("manager")}</SelectItem>
                <SelectItem value="COMPANY_ADMIN">{tRoles("admin")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.role && <ErrorMessage>{errors.role.message}</ErrorMessage>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hireDate">{t("hireDate")} *</Label>
          <div className="relative">
            <DatePicker
              date={watch("hireDate") ? new Date(watch("hireDate") as string) : undefined}
              setDate={(date) => setValue("hireDate", date ? toLocalDateString(date) : "")}
              placeholder={t("hireDate")}
            />
          </div>
          {errors.hireDate && <ErrorMessage>{errors.hireDate.message}</ErrorMessage>}
        </div>

        <div className="md:col-span-2 space-y-3">
          <Label>{t("workingDays")}</Label>
          <div className="flex flex-wrap gap-2">
            {weekdays.map((day) => (
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
            {t("workingDaysNote")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
