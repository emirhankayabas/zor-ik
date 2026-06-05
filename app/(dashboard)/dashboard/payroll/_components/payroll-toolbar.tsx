"use client";

import { useTranslations } from "next-intl";
import { Calculator, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  month: number;
  year: number;
  months: { id: number; name: string }[];
  years: number[];
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function PayrollToolbar({
  month,
  year,
  months,
  years,
  onMonthChange,
  onYearChange,
  onGenerate,
  isGenerating,
}: Props) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");

  return (
    <div className="flex items-center gap-2">
      <Select value={month.toString()} onValueChange={(v) => onMonthChange(parseInt(v))}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder={tCommon("selectMonth")} />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.id} value={m.id.toString()}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year.toString()} onValueChange={(v) => onYearChange(parseInt(v))}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder={tCommon("year")} />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={onGenerate} disabled={isGenerating}>
        {isGenerating ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Calculator className="mr-2 size-4" />
        )}
        {t("generatePayrolls")}
      </Button>
    </div>
  );
}
