"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SuccessCard() {
  const t = useTranslations("employees");

  return (
    <div className="max-w-xl mx-auto mt-20 px-4">
      <Card className="shadow-none rounded-2xl border-emerald-500/20 bg-emerald-500/5">
        <CardContent className="pt-12 pb-12 text-center space-y-4">
          <div className="size-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {t("registrationSuccess")}
          </h2>
          <p className="text-muted-foreground font-medium text-sm">
            {t("registrationSuccessDesc")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
