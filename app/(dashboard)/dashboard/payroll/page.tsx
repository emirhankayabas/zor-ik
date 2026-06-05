"use client";

import { useTranslations } from "next-intl";
import { Calculator, Wallet } from "lucide-react";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePayroll } from "./_components/use-payroll";
import { PayrollToolbar } from "./_components/payroll-toolbar";
import { PayrollStats } from "./_components/payroll-stats";
import { PayrollTable } from "./_components/payroll-table";
import { SalaryTable } from "./_components/salary-table";
import { SalaryEditDialog } from "./_components/salary-edit-dialog";

export default function PayrollPage() {
  const t = useTranslations("payroll");
  const payroll = usePayroll();

  return (
    <div className="flex flex-col gap-6 px-4 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <CardTitle className="text-xl mb-0.5 font-medium">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </div>

        <PayrollToolbar
          month={payroll.month}
          year={payroll.year}
          months={payroll.months}
          years={payroll.years}
          onMonthChange={payroll.setMonth}
          onYearChange={payroll.setYear}
          onGenerate={payroll.generatePayroll}
          isGenerating={payroll.isGenerating}
        />
      </div>

      <PayrollStats stats={payroll.stats} />

      <Tabs defaultValue="payrolls" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="payrolls">
            <Calculator className="size-4 mr-2" /> {t("calculatedPayrolls")}
          </TabsTrigger>
          <TabsTrigger value="salaries">
            <Wallet className="size-4 mr-2" /> {t("salaryDefinitions")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payrolls">
          <PayrollTable
            payrollData={payroll.payrollData}
            isLoading={payroll.isLoading}
            month={payroll.month}
            year={payroll.year}
            months={payroll.months}
          />
        </TabsContent>

        <TabsContent value="salaries">
          <SalaryTable employees={payroll.employees} onEdit={payroll.openSalaryDialog} />
        </TabsContent>
      </Tabs>

      <SalaryEditDialog
        employee={payroll.selectedEmployee}
        tempSalary={payroll.tempSalary}
        tempNetSalary={payroll.tempNetSalary}
        isSaving={payroll.isUpdatingSalary}
        onGrossChange={payroll.handleGrossChange}
        onNetChange={payroll.handleNetChange}
        onClose={payroll.closeSalaryDialog}
        onSave={payroll.updateSalary}
      />
    </div>
  );
}
