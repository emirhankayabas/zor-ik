"use client";

import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { ShiftOption } from "@/lib/types";

interface Props {
  shifts: ShiftOption[];
  selectedShiftId: string;
  setSelectedShiftId: (id: string) => void;
  selectedWorkingDays: number[];
  toggleWorkingDay: (day: number) => void;
}

export function ShiftWorkFields({
  shifts,
  selectedShiftId,
  setSelectedShiftId,
  selectedWorkingDays,
  toggleWorkingDay,
}: Props) {
  const t = useTranslations("employees");
  const tCommon = useTranslations("common");
  const tWeekdays = useTranslations("weekdays");

  const weekdays = [
    { id: 1, label: tWeekdays("mon") },
    { id: 2, label: tWeekdays("tue") },
    { id: 3, label: tWeekdays("wed") },
    { id: 4, label: tWeekdays("thu") },
    { id: 5, label: tWeekdays("fri") },
    { id: 6, label: tWeekdays("sat") },
    { id: 0, label: tWeekdays("sun") },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
            <Clock className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">{t("shiftAndWorkDays")}</CardTitle>
            <CardDescription>{t("shiftAndWorkDaysDesc")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4 space-y-6">
        <div className="space-y-2">
          <Label>{t("shift")}</Label>
          <Select
            value={selectedShiftId || "none"}
            onValueChange={(val) => setSelectedShiftId(val === "none" ? "" : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectShift")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{tCommon("unassigned")}</SelectItem>
              {shifts.map((shift) => (
                <SelectItem key={shift.id} value={shift.id}>
                  {shift.name} ({shift.startTime} - {shift.endTime})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>{t("workingDays")}</Label>
          <div className="flex flex-wrap gap-2">
            {weekdays.map((day) => (
              <Button
                key={day.id}
                type="button"
                variant={selectedWorkingDays.includes(day.id) ? "default" : "outline"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => toggleWorkingDay(day.id)}
              >
                {day.label}
              </Button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            {t("shiftAndWorkDaysDesc")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
