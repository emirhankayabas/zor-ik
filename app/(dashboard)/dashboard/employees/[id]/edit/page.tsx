"use client";

import { use } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useEmployeeEdit } from "./_components/use-employee-edit";
import { ProfileFields } from "./_components/profile-fields";
import { ShiftWorkFields } from "./_components/shift-work-fields";
import { OzlukFields } from "../../_components/ozluk-fields";

export default function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const {
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
  } = useEmployeeEdit(id);

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
          <h1 className="text-2xl font-bold tracking-tight">{t("editTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("editSubtitle")}</p>
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
          <ProfileFields form={form} departments={departments} />
          <ShiftWorkFields
            shifts={shifts}
            selectedShiftId={selectedShiftId}
            setSelectedShiftId={setSelectedShiftId}
            selectedWorkingDays={selectedWorkingDays}
            toggleWorkingDay={toggleWorkingDay}
          />
          <OzlukFields form={form} />

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
