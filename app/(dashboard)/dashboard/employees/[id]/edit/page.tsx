"use client";
import { apiUrl } from "@/lib/api";

import { z } from "zod";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getEmployeeSchema } from "@/lib/validations/employee";
import { useTranslations } from "next-intl";
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
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, UserCircle, Trash2, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const tRoles = useTranslations("roles");
  const tWeekdays = useTranslations("weekdays");
  const tValidation = useTranslations("validation");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [selectedWorkingDays, setSelectedWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
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
  }, [id, router, form]);

  const toggleWorkingDay = (day: number) => {
    setSelectedWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  };

  const onSubmit = async (values: any) => {
    setIsSaving(true);
    try {
      const submitData = {
        ...values,
        departmentId: values.departmentId === "none" ? null : values.departmentId,
        shiftId: selectedShiftId || null,
        workingDays: selectedWorkingDays,
      };

      if (!submitData.password) delete submitData.password;

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
    if (!confirm(t("deleteConfirm")))
      return;

    setIsDeleting(true);
    try {
      const response = await fetch(apiUrl(`/api/employees/${id}`), { method: "DELETE" });

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
          <Link href="/dashboard/employees">
            <ArrowLeft className="mr-2 size-4" /> {tCommon("back")}
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("editTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("editSubtitle")}
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
          {t("deleteEmployee")}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profil Bilgileri */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
                  <UserCircle className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">
                    {t("profileAndTask")}
                  </CardTitle>
                  <CardDescription>
                    {t("profileAndTaskDesc")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>{t("fullName")}</FormLabel>
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
                      <FormLabel>{t("email")}</FormLabel>
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
                      <FormLabel>{t("positionTitle")}</FormLabel>
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
                      <FormLabel>{t("department")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectDepartmentPlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">{tCommon("unassigned")}</SelectItem>
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
                      <FormLabel>{t("systemRole")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectRolePlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EMPLOYEE">
                            {tRoles("employeeStandard")}
                          </SelectItem>
                          <SelectItem value="MANAGER">
                            {tRoles("unitManager")}
                          </SelectItem>
                          <SelectItem value="COMPANY_ADMIN">
                            {tRoles("hrManager")}
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
                      <FormLabel>{t("newPassword")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder={t("newPasswordPlaceholder")}
                        />
                      </FormControl>
                      <FormDescription className="text-xs ml-2">
                        {t("currentPasswordKeep")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vardiya ve Çalışma */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
                  <Clock className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">
                    {t("shiftAndWorkDays")}
                  </CardTitle>
                  <CardDescription>
                    {t("shiftAndWorkDaysDesc")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-4 space-y-6">
              <div className="space-y-2">
                <Label>{t("shift")}</Label>
                <Select
                  value={selectedShiftId || "none"}
                  onValueChange={(val) => setSelectedShiftId(val === "none" ? "" : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectShift")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{tCommon("unassigned")}</SelectItem>
                    {shifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {shift.name} ({shift.startTime} - {shift.endTime})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>{t("workingDays")}</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 1, label: tWeekdays("mon") },
                    { id: 2, label: tWeekdays("tue") },
                    { id: 3, label: tWeekdays("wed") },
                    { id: 4, label: tWeekdays("thu") },
                    { id: 5, label: tWeekdays("fri") },
                    { id: 6, label: tWeekdays("sat") },
                    { id: 0, label: tWeekdays("sun") },
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
                  {t("shiftAndWorkDaysDesc")}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pb-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {t("saveChanges")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
