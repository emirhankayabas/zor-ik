"use client";

import { useTranslations } from "next-intl";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SalaryEmployee } from "./use-payroll";

interface Props {
  employees: SalaryEmployee[];
  onEdit: (employee: SalaryEmployee) => void;
}

export function SalaryTable({ employees, onEdit }: Props) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("salaryDefinitions")}</CardTitle>
        <CardDescription>{t("salaryDefinitionsDesc")}</CardDescription>
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
                    <span className="font-bold text-sm">{emp.user.name}</span>
                    <span className="text-[10px]">{emp.user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{emp.department?.name || "Genel"}</Badge>
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
                  <Button variant="outline" size="sm" onClick={() => onEdit(emp)}>
                    {emp.salary ? tCommon("update") : t("defineSalary")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
