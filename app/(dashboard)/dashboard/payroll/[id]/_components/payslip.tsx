"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateLocale } from "@/lib/status-helpers";

export interface PayslipData {
  companyName: string;
  employeeName: string;
  employeeEmail: string;
  position: string;
  departmentName: string;
  hireDate: string;
  periodLabel: string;
  grossSalary: number;
  sgkEmployee: number;
  unemployment: number;
  incomeTax: number;
  stampTax: number;
  taxExemption: number;
  netSalary: number;
  sgkEmployer: number;
  unemploymentEmployer: number;
  totalEmployerCost: number;
  calculatedAt: string;
}

const money = (n: number) =>
  `₺${(n || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;

function Row({
  label,
  value,
  strong = false,
  muted = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={strong ? "font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}

export function Payslip({ data }: { data: PayslipData }) {
  const t = useTranslations("payslip");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const totalDeductions =
    data.sgkEmployee + data.unemployment + data.incomeTax + data.stampTax;

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto pb-12">
      {/* Eylemler — yazdırmada gizlenir */}
      <div className="no-print flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href="/dashboard/payroll">
            <ArrowLeft className="mr-2 size-4" /> {t("backToPayroll")}
          </Link>
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 size-4" /> {t("print")}
        </Button>
      </div>

      <Card id="payslip-print" className="print:shadow-none print:border-0">
        <CardContent className="p-8 space-y-6">
          {/* Başlık */}
          <div className="flex items-start justify-between border-b pb-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                {t("employer")}
              </p>
              <h1 className="text-xl font-black tracking-tight">{data.companyName}</h1>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold">{t("title")}</h2>
              <p className="text-sm text-muted-foreground">{data.periodLabel}</p>
            </div>
          </div>

          {/* Çalışan bilgisi */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                {t("employee")}
              </p>
              <p className="font-bold">{data.employeeName}</p>
              <p className="text-muted-foreground text-xs">{data.employeeEmail}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[11px] text-muted-foreground">{tCommon("department")}</p>
                <p className="font-medium">{data.departmentName}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">{tCommon("position")}</p>
                <p className="font-medium">{data.position}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">{t("hireDate")}</p>
                <p className="font-medium">{formatDateLocale(data.hireDate, locale)}</p>
              </div>
            </div>
          </div>

          {/* Kazançlar & Kesintiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border p-4">
              <p className="text-sm font-bold text-emerald-600 mb-2">{t("earnings")}</p>
              <Row label={t("grossSalary")} value={money(data.grossSalary)} />
              <Separator className="my-2" />
              <Row label={t("totalEarnings")} value={money(data.grossSalary)} strong />
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm font-bold text-rose-600 mb-2">{t("deductions")}</p>
              <Row label={t("sgkPremium")} value={money(data.sgkEmployee)} />
              <Row label={t("unemploymentInsurance")} value={money(data.unemployment)} />
              <Row label={t("incomeTax")} value={money(data.incomeTax)} />
              <Row label={t("stampTax")} value={money(data.stampTax)} />
              {data.taxExemption > 0 && (
                <Row
                  label={t("taxExemption")}
                  value={`- ${money(data.taxExemption)}`}
                  muted
                />
              )}
              <Separator className="my-2" />
              <Row label={t("totalDeductions")} value={money(totalDeductions)} strong />
            </div>
          </div>

          {/* Net */}
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center justify-between">
            <span className="font-bold">{t("netSalary")}</span>
            <span className="text-2xl font-black text-primary">{money(data.netSalary)}</span>
          </div>

          {/* İşveren maliyeti */}
          <div className="rounded-xl border p-4">
            <p className="text-sm font-bold text-muted-foreground mb-2">{t("employerCost")}</p>
            <Row label={t("sgkEmployer")} value={money(data.sgkEmployer)} muted />
            <Row label={t("unemploymentEmployer")} value={money(data.unemploymentEmployer)} muted />
            <Separator className="my-2" />
            <Row label={t("totalEmployerCost")} value={money(data.totalEmployerCost)} strong />
          </div>

          {/* İmza alanları */}
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="text-center">
              <div className="border-t border-foreground/30 pt-2 text-xs text-muted-foreground">
                {t("employeeSignature")}
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-foreground/30 pt-2 text-xs text-muted-foreground">
                {t("employerSignature")}
              </div>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center pt-2 border-t">
            {t("legalNote")}
            {" · "}
            {t("generatedAt")}: {formatDateLocale(data.calculatedAt, locale)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
