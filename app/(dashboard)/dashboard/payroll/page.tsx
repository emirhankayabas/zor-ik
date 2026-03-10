"use client";

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

export default function PayrollPage() {
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
    { id: 1, name: "Ocak" },
    { id: 2, name: "Şubat" },
    { id: 3, name: "Mart" },
    { id: 4, name: "Nisan" },
    { id: 5, name: "Mayıs" },
    { id: 6, name: "Haziran" },
    { id: 7, name: "Temmuz" },
    { id: 8, name: "Ağustos" },
    { id: 9, name: "Eylül" },
    { id: 10, name: "Ekim" },
    { id: 11, name: "Kasım" },
    { id: 12, name: "Aralık" },
  ];

  const years = [2024, 2025, 2026];

  const fetchPayrolls = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/payroll?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Veriler alınamadı");
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
      const res = await fetch(`/api/employees/salaries`);
      if (!res.ok) throw new Error("Çalışan bilgileri alınamadı");
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
      const res = await fetch(`/api/employees/${selectedEmployee.id}/salary`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseSalary: parseFloat(tempSalary),
          currency: "TRY",
        }),
      });

      if (!res.ok) throw new Error("Maaş güncellenirken hata oluştu");

      toast.success("Maaş güncellendi");
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
      const res = await fetch("/api/payroll/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });

      if (!res.ok) throw new Error("Bordro oluşturulurken hata oluştu");

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
            Bordro Yönetimi
          </CardTitle>
          <CardDescription>
            Gelir vergisi, SGK ve damga vergisi dahil profesyonel bordro
            hesaplama.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={month.toString()}
            onValueChange={(v) => setMonth(parseInt(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Ay Seçin" />
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
              <SelectValue placeholder="Yıl" />
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
            Bordroları Oluştur
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm">
              Toplam Brüt
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
              Toplam Net Ödeme
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
              SGK & İşsizlik
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
              Gelir & Damga Vergisi
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
            <Calculator className="size-4 mr-2" /> Hesaplanan Bordrolar
          </TabsTrigger>
          <TabsTrigger value="salaries">
            <Wallet className="size-4 mr-2" /> Maaş Tanımlama
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payrolls">
          <Card>
            <CardHeader className="px-3 gap-0.5!">
              <CardTitle>Hesaplanan Bordro Listesi</CardTitle>
              <CardDescription>
                {months.find((m) => m.id === month)?.name} {year} dönemi için
                kayıtlar.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-3 overflow-hidden">
              <Table className="border-collapse border">
                <TableHeader>
                  {/* First Header Row */}
                  <TableRow>
                    <TableHead rowSpan={3} className="border font-bold">
                      Çalışan
                    </TableHead>
                    <TableHead
                      rowSpan={3}
                      className="border text-center font-bold"
                    >
                      Net Ücret ₺
                    </TableHead>
                    <TableHead className="border text-center text-[10px] py-1 h-auto text-green-700 font-medium">
                      İlave ₺
                    </TableHead>
                    <TableHead
                      rowSpan={3}
                      className="border text-center font-bold"
                    >
                      Maaş ₺
                    </TableHead>
                    <TableHead
                      colSpan={5}
                      className="border text-center text-red-600 font-bold py-1 h-auto"
                    >
                      Yasal Kesintiler ₺
                    </TableHead>
                    <TableHead
                      rowSpan={3}
                      className="border text-center font-bold"
                    >
                      Brüt Ücret ₺
                    </TableHead>
                  </TableRow>
                  {/* Second Header Row */}
                  <TableRow>
                    <TableHead
                      rowSpan={2}
                      className="border text-center text-green-700 font-bold leading-tight"
                    >
                      Asgari Geçim İndirimi
                      <div className="text-[8px] font-normal text-muted-foreground">
                        (Eş ve Çocuk durumu)
                      </div>
                    </TableHead>
                    <TableHead
                      colSpan={2}
                      className="border text-center text-orange-600 font-bold py-1 h-auto"
                    >
                      SGK + İşsizlik
                    </TableHead>
                    <TableHead
                      rowSpan={2}
                      className="border text-center text-red-600 font-bold py-1 h-auto leading-tight"
                    >
                      Damga Vergisi
                    </TableHead>
                    <TableHead
                      colSpan={2}
                      className="border text-center text-red-600 font-bold py-1 h-auto"
                    >
                      Vergi
                    </TableHead>
                  </TableRow>
                  {/* Third Header Row */}
                  <TableRow>
                    <TableHead className="border text-center text-orange-600 font-bold text-[11px] px-2">
                      Çalışan SGK Primi
                    </TableHead>
                    <TableHead className="border text-center text-orange-600 font-bold text-[11px] px-2">
                      Çalışan İşsizlik Sigortası
                    </TableHead>
                    <TableHead className="border text-center text-red-600 font-medium text-[11px]">
                      Dilim
                    </TableHead>
                    <TableHead className="border text-center text-red-600 font-medium text-[11px]">
                      Gelir Vergisi
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
                        Seçili dönem için henüz bordro oluşturulmamış.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payrollData.map((p, idx) => (
                      <TableRow key={p.id}>
                        <TableCell className="border px-4 py-2">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm whitespace-nowrap">
                              {p.employee?.user?.name || "İsimsiz Çalışan"}
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
                              Asgari Geçim İndirimi 2022 itibarıyla
                              kaldırılmıştır.
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
              <CardTitle className="text-lg">Çalışan Maaş Tanımları</CardTitle>
              <CardDescription>
                Bordro hesaplanabilmesi için çalışanların brüt maaşlarının
                tanımlı olması gerekir.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Çalışan</TableHead>
                    <TableHead>Departman</TableHead>
                    <TableHead>Pozisyon</TableHead>
                    <TableHead>Tanımlı Brüt Maaş</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
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
                          <Badge variant="outline">Tanımsız</Badge>
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
                          {emp.salary ? "Güncelle" : "Maaş Tanımla"}
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
            <DialogTitle>Maaş Tanımla / Güncelle</DialogTitle>
            <DialogDescription>
              {selectedEmployee?.user.name} isimli çalışan için brüt aylık maaş
              belirleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="salary" className="text-right">
                Brüt Maaş
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
                Net Maaş
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
                  SGK + İşsizlik (%15)
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
                  Gelir + Damga V. (Tahmini)
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
                <span>Net Ele Geçen</span>
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
                2026 yasal parametrelerine göre hesaplanmıştır. Gelir vergisi
                dilimleri (%15, %20...) kümülatif matraha göre değişiklik
                gösterebilir.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEmployee(null)}>
              Vazgeç
            </Button>
            <Button onClick={updateSalary} disabled={isUpdatingSalary}>
              {isUpdatingSalary && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
