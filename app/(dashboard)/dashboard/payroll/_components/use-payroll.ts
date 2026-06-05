"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api";
import {
  calculateNetFromGross,
  calculateGrossFromNet,
} from "@/lib/payroll-engine";

export interface PayrollStats {
  totalGross: number;
  totalNet: number;
  totalSgk: number;
  totalTax: number;
}

/**
 * Bordro sayfasının tüm durum yönetimi ve veri çekme mantığını kapsar.
 * Sayfa ve alt bileşenler yalnızca dönen değerleri kullanır.
 */
export function usePayroll() {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingSalary, setIsUpdatingSalary] = useState(false);
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [tempSalary, setTempSalary] = useState<string>(""); // Gross
  const [tempNetSalary, setTempNetSalary] = useState<string>(""); // Net
  const [stats, setStats] = useState<PayrollStats>({
    totalGross: 0,
    totalNet: 0,
    totalSgk: 0,
    totalTax: 0,
  });

  const months = [
    { id: 1, name: t("months.1") },
    { id: 2, name: t("months.2") },
    { id: 3, name: t("months.3") },
    { id: 4, name: t("months.4") },
    { id: 5, name: t("months.5") },
    { id: 6, name: t("months.6") },
    { id: 7, name: t("months.7") },
    { id: 8, name: t("months.8") },
    { id: 9, name: t("months.9") },
    { id: 10, name: t("months.10") },
    { id: 11, name: t("months.11") },
    { id: 12, name: t("months.12") },
  ];

  const years = [2024, 2025, 2026];

  const fetchPayrolls = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/payroll?month=${month}&year=${year}`));
      if (!res.ok) throw new Error(t("dataLoadError") || tCommon("errorOccurred"));
      const data = await res.json();
      setPayrollData(data.payrolls);
      setStats(data.stats);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(apiUrl(`/api/employees/salaries`));
      if (!res.ok) throw new Error(tCommon("fetchError"));
      const data = await res.json();
      setEmployees(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const handleGrossChange = (val: string) => {
    setTempSalary(val);
    const gross = parseFloat(val);
    if (!isNaN(gross)) {
      const result = calculateNetFromGross(gross);
      setTempNetSalary(result.netSalary.toFixed(2));
    } else {
      setTempNetSalary("");
    }
  };

  const handleNetChange = (val: string) => {
    setTempNetSalary(val);
    const net = parseFloat(val);
    if (!isNaN(net)) {
      const gross = calculateGrossFromNet(net);
      setTempSalary(gross.toFixed(2));
    } else {
      setTempSalary("");
    }
  };

  /** Maaş düzenleme dialogunu açar ve seçilen çalışanın mevcut maaşını doldurur. */
  const openSalaryDialog = (emp: any) => {
    setSelectedEmployee(emp);
    const gross = emp.salary?.baseSalary || 0;
    setTempSalary(gross > 0 ? gross.toString() : "");
    if (gross > 0) {
      const result = calculateNetFromGross(gross);
      setTempNetSalary(result.netSalary.toFixed(2));
    } else {
      setTempNetSalary("");
    }
  };

  const closeSalaryDialog = () => setSelectedEmployee(null);

  const updateSalary = async () => {
    if (!selectedEmployee || !tempSalary) return;

    setIsUpdatingSalary(true);
    try {
      const res = await fetch(apiUrl(`/api/employees/${selectedEmployee.id}/salary`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseSalary: parseFloat(tempSalary),
          currency: "TRY",
        }),
      });

      if (!res.ok) throw new Error(t("updateError"));

      toast.success(t("updatedSuccess") || tCommon("updatedSuccess"));
      setSelectedEmployee(null);
      fetchEmployees();
      fetchPayrolls();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdatingSalary(false);
    }
  };

  const generatePayroll = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(apiUrl("/api/payroll/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });

      if (!res.ok) throw new Error(t("generateError") || tCommon("errorOccurred"));

      const data = await res.json();
      toast.success(data.message);
      fetchPayrolls();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    month,
    setMonth,
    year,
    setYear,
    months,
    years,
    isLoading,
    isGenerating,
    isUpdatingSalary,
    payrollData,
    employees,
    stats,
    selectedEmployee,
    tempSalary,
    tempNetSalary,
    handleGrossChange,
    handleNetChange,
    openSalaryDialog,
    closeSalaryDialog,
    updateSalary,
    generatePayroll,
  };
}
