"use client";

import { useTranslations } from "next-intl";
import { TrendingUp, DollarSign, Users, CreditCard } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PayrollStats as PayrollStatsData } from "./use-payroll";

interface Props {
  stats: PayrollStatsData;
}

export function PayrollStats({ stats }: Props) {
  const t = useTranslations("payroll");

  const cards = [
    { label: t("totalGross"), value: stats.totalGross, Icon: TrendingUp, valueClass: "" },
    { label: t("totalNet"), value: stats.totalNet, Icon: DollarSign, valueClass: "text-primary" },
    { label: t("sgkUnemploymentShort"), value: stats.totalSgk, Icon: Users, valueClass: "" },
    { label: t("taxEstimate"), value: stats.totalTax, Icon: CreditCard, valueClass: "" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, Icon, valueClass }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm">{label}</CardTitle>
            <Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 mt-1">
            <div className={`text-2xl font-bold ${valueClass}`}>
              ₺{value.toLocaleString("tr-TR")}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
