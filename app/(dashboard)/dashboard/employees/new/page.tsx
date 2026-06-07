"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNewEmployee } from "./_components/use-new-employee";
import { PersonalInfoFields } from "./_components/personal-info-fields";
import { TaskAuthFields } from "./_components/task-auth-fields";
import { SuccessCard } from "./_components/success-card";
import { OzlukFields } from "../_components/ozluk-fields";

export default function NewEmployeePage() {
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const {
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
  } = useNewEmployee();

  if (success) {
    return <SuccessCard />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 pb-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/employees`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-1">
        <CardTitle className="text-xl mb-0.5 font-medium">{t("newTitle")}</CardTitle>
        <CardDescription>{t("newSubtitle")}</CardDescription>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalInfoFields form={form} emailDomain={emailDomain} />
        <TaskAuthFields
          form={form}
          departments={departments}
          selectedWorkingDays={selectedWorkingDays}
          toggleWorkingDay={toggleWorkingDay}
        />
        <OzlukFields form={form} />

        {error && (
          <Alert variant="destructive">
            <AlertTitle>{tCommon("errorOccurred")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" size="sm" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {tCommon("saving")}
              </>
            ) : (
              <>
                <Plus />
                {t("saveEmployee")}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
