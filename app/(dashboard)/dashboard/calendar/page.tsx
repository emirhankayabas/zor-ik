"use client";
import { apiUrl } from "@/lib/api";

import * as React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { ChevronLeft, ChevronRight, Palmtree, Plane, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusStyle, getStatusLabel } from "@/lib/status-helpers";

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
  actualDays: number;
  leaveType: {
    name: string;
  };
}

interface Holiday {
  id: string;
  date: string;
  name: string;
  isHalfDay: boolean;
}



export default function CalendarPage() {
  const t = useTranslations("calendar");
  const tStatus = useTranslations("status");
  const locale = useLocale();
  const dateLocale = locale === "tr" ? tr : enUS;

  const weekDays = [
    format(new Date(2024, 0, 1), "EEEEEE", { locale: dateLocale }),
    format(new Date(2024, 0, 2), "EEEEEE", { locale: dateLocale }),
    format(new Date(2024, 0, 3), "EEEEEE", { locale: dateLocale }),
    format(new Date(2024, 0, 4), "EEEEEE", { locale: dateLocale }),
    format(new Date(2024, 0, 5), "EEEEEE", { locale: dateLocale }),
    format(new Date(2024, 0, 6), "EEEEEE", { locale: dateLocale }),
    format(new Date(2024, 0, 7), "EEEEEE", { locale: dateLocale }),
  ];
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [leaves, setLeaves] = React.useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = React.useState<Holiday[]>([]);
  const [, setLoading] = React.useState(true);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Fetch data when month changes
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const startDate = format(monthStart, "yyyy-MM-dd");
        const endDate = format(monthEnd, "yyyy-MM-dd");

        const [leavesRes, holidaysRes] = await Promise.all([
          fetch(apiUrl("/api/leave-requests?personal=true")),
          fetch(apiUrl(`/api/holidays?startDate=${startDate}&endDate=${endDate}`)),
        ]);

        if (leavesRes.ok) {
          const data = await leavesRes.json();
          setLeaves(data);
        }
        if (holidaysRes.ok) {
          const data = await holidaysRes.json();
          setHolidays(data);
        }
      } catch (error) {
        console.error(t("loadError"), error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentMonth]);

  // Build calendar grid (weeks start on Monday)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Helper: get leaves that cover a specific date
  function getLeavesForDate(date: Date): LeaveRequest[] {
    return leaves.filter((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      // Normalize to date-only comparison
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return isWithinInterval(date, { start, end });
    });
  }

  // Helper: get holidays for a specific date
  function getHolidaysForDate(date: Date): Holiday[] {
    return holidays.filter((h) => {
      const hDate = new Date(h.date);
      return isSameDay(date, hDate);
    });
  }

  // Status to dot color mapping
  function getStatusDotColor(status: string): string {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-500";
      case "PENDING":
        return "bg-amber-500";
      case "MANAGER_APPROVED":
        return "bg-blue-500";
      case "REJECTED":
        return "bg-rose-500";
      default:
        return "bg-gray-400";
    }
  }

  const selectedLeaves = selectedDate ? getLeavesForDate(selectedDate) : [];
  const selectedHolidays = selectedDate ? getHolidaysForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <CardTitle className="text-lg capitalize">
                {format(currentMonth, "LLLL yyyy", { locale: dateLocale })}
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground py-2 capitalize"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const dayLeaves = getLeavesForDate(day);
                const dayHolidays = getHolidaysForDate(day);
                const isHoliday = dayHolidays.length > 0;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-1 h-14 md:h-16 rounded-lg transition-colors text-sm",
                      !isCurrentMonth && "text-muted-foreground/40",
                      isCurrentMonth && "hover:bg-accent/50",
                      isToday && "font-bold",
                      isSelected && "ring-2 ring-primary bg-primary/5",
                      isHoliday && isCurrentMonth && "bg-purple-500/10"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm leading-none",
                        isToday && "flex items-center justify-center size-7 rounded-full bg-primary text-primary-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>

                    {/* Status dots */}
                    {isCurrentMonth && dayLeaves.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {dayLeaves.slice(0, 3).map((leave, i) => (
                          <div
                            key={i}
                            className={cn(
                              "size-1.5 rounded-full",
                              getStatusDotColor(leave.status)
                            )}
                          />
                        ))}
                      </div>
                    )}

                    {/* Holiday indicator */}
                    {isCurrentMonth && isHoliday && dayLeaves.length === 0 && (
                      <div className="flex mt-1">
                        <div className="size-1.5 rounded-full bg-purple-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-emerald-500" />
                <span>{t("approvedLeave")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-amber-500" />
                <span>{t("pendingLeave")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-blue-500" />
                <span>{t("managerApprovedLeave")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-rose-500" />
                <span>{t("rejectedLeave")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-purple-500" />
                <span>{t("holiday")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="size-4" />
              {selectedDate
                ? format(selectedDate, "d MMMM yyyy, EEEE", { locale: dateLocale })
                : t("selectDay")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate && (
              <p className="text-sm text-muted-foreground">
                {t("selectDayDesc")}
              </p>
            )}

            {selectedDate && selectedHolidays.length === 0 && selectedLeaves.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("noRecords")}</p>
            )}

            {selectedDate && (
              <div className="space-y-4">
                {/* Holidays */}
                {selectedHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10"
                  >
                    <Palmtree className="size-4 text-purple-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{holiday.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {holiday.isHalfDay ? t("halfDay") : t("officialHoliday")}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Leave Requests */}
                {selectedLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                  >
                    <Plane className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{leave.leaveType?.name || t("leave")}</p>
                        <Badge variant="outline" className={cn("text-[10px]", getStatusStyle(leave.status))}>
                          {getStatusLabel(leave.status, tStatus)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(leave.startDate), "d MMM", { locale: dateLocale })} — {format(new Date(leave.endDate), "d MMM yyyy", { locale: dateLocale })}
                        {leave.actualDays ? ` (${t("workDays", { count: leave.actualDays })})` : ""}
                      </p>
                      {leave.reason && (
                        <p className="text-xs text-muted-foreground truncate">{leave.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
