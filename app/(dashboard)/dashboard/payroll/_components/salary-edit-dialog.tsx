"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { SalaryEmployee } from "./use-payroll";

interface Props {
  employee: SalaryEmployee | null;
  tempSalary: string;
  tempNetSalary: string;
  isSaving: boolean;
  onGrossChange: (val: string) => void;
  onNetChange: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function SalaryEditDialog({
  employee,
  tempSalary,
  tempNetSalary,
  isSaving,
  onGrossChange,
  onNetChange,
  onClose,
  onSave,
}: Props) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");

  return (
    <Dialog open={!!employee} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("dialogDesc", { name: employee?.user.name ?? "" })}
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
              onChange={(e) => onGrossChange(e.target.value)}
              className="col-span-3"
              placeholder="Örn: 50000"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="netSalary" className="text-right font-bold text-primary">
              {t("netSalaryLabel")}
            </Label>
            <Input
              id="netSalary"
              type="number"
              value={tempNetSalary}
              onChange={(e) => onNetChange(e.target.value)}
              className="col-span-3 border-primary/30 focus-visible:ring-primary"
              placeholder="Örn: 35000"
            />
          </div>
          <div className="flex flex-col gap-2 rounded-xl">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{t("sgkPercent")}</span>
              <span>
                ₺
                {((parseFloat(tempSalary) || 0) * 0.15).toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{t("taxEstimate")}</span>
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
            <p>{t("legalNote")}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            {tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
