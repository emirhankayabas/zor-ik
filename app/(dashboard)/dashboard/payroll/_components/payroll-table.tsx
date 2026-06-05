"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  payrollData: any[];
  isLoading: boolean;
  month: number;
  year: number;
  months: { id: number; name: string }[];
}

export function PayrollTable({ payrollData, isLoading, month, year, months }: Props) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");

  return (
    <Card>
      <CardHeader className="px-3 gap-0.5!">
        <CardTitle>{t("calculatedPayrollList")}</CardTitle>
        <CardDescription>
          {t("periodDesc", {
            month: months.find((m) => m.id === month)?.name || "",
            year,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 mt-3 overflow-hidden">
        <Table className="border-collapse border">
          <TableHeader>
            {/* First Header Row */}
            <TableRow>
              <TableHead rowSpan={3} className="border font-bold">
                {tCommon("person")}
              </TableHead>
              <TableHead rowSpan={3} className="border text-center font-bold">
                {t("netSalaryLabel")} ₺
              </TableHead>
              <TableHead className="border text-center text-[10px] py-1 h-auto text-green-700 font-medium">
                {t("additional")} ₺
              </TableHead>
              <TableHead rowSpan={3} className="border text-center font-bold">
                {t("salary")} ₺
              </TableHead>
              <TableHead
                colSpan={5}
                className="border text-center text-red-600 font-bold py-1 h-auto"
              >
                {t("legalDeductions")} ₺
              </TableHead>
              <TableHead rowSpan={3} className="border text-center font-bold">
                {t("grossSalaryLabel")} ₺
              </TableHead>
            </TableRow>
            {/* Second Header Row */}
            <TableRow>
              <TableHead
                rowSpan={2}
                className="border text-center text-green-700 font-bold leading-tight"
              >
                {t("agi")}
                <div className="text-[8px] font-normal text-muted-foreground">
                  {t("agiSubtitle")}
                </div>
              </TableHead>
              <TableHead
                colSpan={2}
                className="border text-center text-orange-600 font-bold py-1 h-auto"
              >
                {t("sgkUnemploymentShort")}
              </TableHead>
              <TableHead
                rowSpan={2}
                className="border text-center text-red-600 font-bold py-1 h-auto leading-tight"
              >
                {t("stampTax")}
              </TableHead>
              <TableHead
                colSpan={2}
                className="border text-center text-red-600 font-bold py-1 h-auto"
              >
                {t("tax")}
              </TableHead>
            </TableRow>
            {/* Third Header Row */}
            <TableRow>
              <TableHead className="border text-center text-orange-600 font-bold text-[11px] px-2">
                {t("sgkPremium")}
              </TableHead>
              <TableHead className="border text-center text-orange-600 font-bold text-[11px] px-2">
                {t("unemploymentInsurance")}
              </TableHead>
              <TableHead className="border text-center text-red-600 font-medium text-[11px]">
                {t("taxBracket")}
              </TableHead>
              <TableHead className="border text-center text-red-600 font-medium text-[11px]">
                {t("incomeTax")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : payrollData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t("noPayrollGenerated")}
                </TableCell>
              </TableRow>
            ) : (
              payrollData.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="border px-4 py-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm whitespace-nowrap">
                        {p.employee?.user?.name || t("unnamed")}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-37.5">
                        {p.employee?.user?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="border text-right font-bold pr-4">
                    {(p.netSalary || 0).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="border text-center text-muted-foreground text-[10px] p-1 font-normal leading-tight max-w-30">
                    {p.agi > 0 ? (
                      p.agi.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })
                    ) : (
                      <div className="text-[7px] scale-90">{t("agiRemoved")}</div>
                    )}
                  </TableCell>
                  <TableCell className="border text-right font-bold pr-4">
                    {(p.totalSalary || p.netSalary || 0).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="border text-right text-orange-600/80 pr-4">
                    {(p.sgkEmployee || 0).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="border text-right text-orange-600/80 pr-4">
                    {(p.unemploymentEmployee || 0).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="border text-center text-red-600/80">
                    {(p.stampTax || 0).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="border text-center text-red-700/80 font-medium">
                    %{p.taxRate ? p.taxRate * 100 : 15}
                  </TableCell>
                  <TableCell className="border text-right text-red-600/80 pr-4">
                    {(p.incomeTax || 0).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="border text-right font-bold pr-4">
                    {(p.grossSalary || 0).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
