"use client";
import { apiUrl } from "@/lib/api";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  calculateNetFromGross,
  calculateGrossFromNet,
} from "@/lib/payroll-engine";
import {
  Calculator,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  CreditCard,
  DollarSign,
  Users,
  Wallet,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function PayrollPage() {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const router = useRouter();
  
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
  const [stats, setStats] = useState({
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

  return (
    <div className="flex flex-col gap-6 px-4 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <CardTitle className="text-xl mb-0.5 font-medium">
            {t("title")}
          </CardTitle>
          <CardDescription>
            {t("subtitle")}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={month.toString()}
            onValueChange={(v) => setMonth(parseInt(v))}
          >
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

          <Select
            value={year.toString()}
            onValueChange={(v) => setYear(parseInt(v))}
          >
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

          <Button onClick={generatePayroll} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Calculator className="mr-2 size-4" />
            )}
            {t("generatePayrolls")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm">
              {t("totalGross")}
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 mt-1">
            <div className="text-2xl font-bold">
              ₺{stats.totalGross.toLocaleString("tr-TR")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm">
              {t("totalNet")}
            </CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 mt-1">
            <div className="text-2xl font-bold text-primary">
              ₺{stats.totalNet.toLocaleString("tr-TR")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm">
              {t("sgkUnemploymentShort")}
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 mt-1">
            <div className="text-2xl font-bold">
              ₺{stats.totalSgk.toLocaleString("tr-TR")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm">
              {t("taxEstimate")}
            </CardTitle>
            <CreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 mt-1">
            <div className="text-2xl font-bold">
              ₺{stats.totalTax.toLocaleString("tr-TR")}
            </div>
          </CardContent>
        </Card>
      </div>

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
                    <TableHead
                      rowSpan={3}
                      className="border text-center font-bold"
                    >
                      {t("netSalaryLabel")} ₺
                    </TableHead>
                    <TableHead className="border text-center text-[10px] py-1 h-auto text-green-700 font-medium">
                      {t("additional")} ₺
                    </TableHead>
                    <TableHead
                      rowSpan={3}
                      className="border text-center font-bold"
                    >
                      {t("salary")} ₺
                    </TableHead>
                    <TableHead
                      colSpan={5}
                      className="border text-center text-red-600 font-bold py-1 h-auto"
                    >
                      {t("legalDeductions")} ₺
                    </TableHead>
                    <TableHead
                      rowSpan={3}
                      className="border text-center font-bold"
                    >
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
                    payrollData.map((p, idx) => (
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
                            <div className="text-[7px] scale-90">
                              {t("agiRemoved")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="border text-right font-bold pr-4">
                          {(p.totalSalary || p.netSalary || 0).toLocaleString(
                            "tr-TR",
                            { minimumFractionDigits: 2 },
                          )}
                        </TableCell>
                        <TableCell className="border text-right text-orange-600/80 pr-4">
                          {(p.sgkEmployee || 0).toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="border text-right text-orange-600/80 pr-4">
                          {(p.unemploymentEmployee || 0).toLocaleString(
                            "tr-TR",
                            { minimumFractionDigits: 2 },
                          )}
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
        </TabsContent>

        <TabsContent value="salaries">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("salaryDefinitions")}</CardTitle>
              <CardDescription>
                {t("salaryDefinitionsDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tCommon("person")}</TableHead>
                    <TableHead>{tCommon("department")}</TableHead>
                    <TableHead>{tCommon("position")}</TableHead>
                    <TableHead>{t("definedGross")}</TableHead>
                    <TableHead className="text-right">{t("action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">
                            {emp.user.name}
                          </span>
                          <span className="text-[10px]">{emp.user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {emp.department?.name || "Genel"}
                        </Badge>
                      </TableCell>
                      <TableCell>{emp.position || "-"}</TableCell>
                      <TableCell>
                        {emp.salary ? (
                          <span className="font-bold">
                            ₺{emp.salary.baseSalary.toLocaleString("tr-TR")}
                          </span>
                        ) : (
                          <Badge variant="outline">{tCommon("undefined")}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEmployee(emp);
                            const gross = emp.salary?.baseSalary || 0;
                            setTempSalary(gross > 0 ? gross.toString() : "");
                            if (gross > 0) {
                              const result = calculateNetFromGross(gross);
                              setTempNetSalary(result.netSalary.toFixed(2));
                            } else {
                              setTempNetSalary("");
                            }
                          }}
                        >
                          {emp.salary ? tCommon("update") : t("defineSalary")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!selectedEmployee}
        onOpenChange={(open) => !open && setSelectedEmployee(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("dialogDesc", { name: selectedEmployee?.user.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="salary" className="text-right">
                {t("grossSalaryLabel")}
              </Label>
              <Input
                id="salary"
                type="number"
                value={tempSalary}
                onChange={(e) => handleGrossChange(e.target.value)}
                className="col-span-3"
                placeholder="Örn: 50000"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="netSalary"
                className="text-right font-bold text-primary"
              >
                {t("netSalaryLabel")}
              </Label>
              <Input
                id="netSalary"
                type="number"
                value={tempNetSalary}
                onChange={(e) => handleNetChange(e.target.value)}
                className="col-span-3 border-primary/30 focus-visible:ring-primary"
                placeholder="Örn: 35000"
              />
            </div>
            <div className="flex flex-col gap-2 rounded-xl">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {t("sgkPercent")}
                </span>
                <span>
                  ₺
                  {((parseFloat(tempSalary) || 0) * 0.15).toLocaleString(
                    "tr-TR",
                    { minimumFractionDigits: 2 },
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {t("taxEstimate")}
                </span>
                <span>
                  ₺
                  {Math.max(
                    0,
                    (parseFloat(tempSalary) || 0) -
                      (parseFloat(tempNetSalary) || 0) -
                      (parseFloat(tempSalary) || 0) * 0.15,
                  ).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-px my-1" />
              <div className="flex justify-between items-center">
                <span>{t("netTakeHome")}</span>
                <span>
                  ₺
                  {(parseFloat(tempNetSalary) || 0).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <p>
                {t("legalNote")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEmployee(null)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={updateSalary} disabled={isUpdatingSalary}>
              {isUpdatingSalary && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {tCommon("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
