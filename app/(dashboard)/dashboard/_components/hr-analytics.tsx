"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import {
  Users,
  Building2,
  Clock3,
  UserPlus,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { CompanyStats } from "@/lib/dashboard-stats";

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface Props {
  stats: CompanyStats;
  locale: string;
}

export function HrAnalytics({ stats, locale }: Props) {
  const t = useTranslations("dashboard");
  const tEmp = useTranslations("employees");
  const dateLocale = locale === "tr" ? tr : enUS;

  const hiresData = useMemo(
    () =>
      stats.hiresByMonth.map((m) => {
        const [y, mo] = m.key.split("-").map(Number);
        return {
          label: format(new Date(y, mo - 1, 1), "LLL", { locale: dateLocale }),
          count: m.count,
        };
      }),
    [stats.hiresByMonth, dateLocale],
  );

  const leaveData = useMemo(
    () =>
      stats.leaveStatusDist.map((s) => ({
        name: t(`hr.status${s.status}`),
        value: s.count,
      })),
    [stats.leaveStatusDist, t],
  );

  const typeData = useMemo(
    () =>
      stats.employmentTypeDist.map((s) => ({
        name: tEmp(`ozluk.employmentTypeOptions.${s.type}`),
        value: s.count,
      })),
    [stats.employmentTypeDist, tEmp],
  );

  const barConfig = {
    count: { label: t("hr.employees"), color: "var(--chart-1)" },
  } satisfies ChartConfig;
  const areaConfig = {
    count: { label: t("hr.hires"), color: "var(--chart-2)" },
  } satisfies ChartConfig;
  const pieConfig = { value: { label: "" } } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <CardTitle className="text-lg">{t("hr.sectionTitle")}</CardTitle>
        <CardDescription>{t("hr.sectionSubtitle")}</CardDescription>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="size-4" />}
          label={t("hr.totalEmployees")}
          value={stats.totalEmployees}
          sub={t("hr.activeEmployees", { count: stats.activeEmployees })}
        />
        <StatCard
          icon={<Building2 className="size-4" />}
          label={t("hr.departments")}
          value={stats.totalDepartments}
        />
        <StatCard
          icon={<Clock3 className="size-4" />}
          label={t("hr.pendingApprovals")}
          value={stats.pendingApprovals}
          sub={t("hr.pendingApprovalsDesc")}
          accent={stats.pendingApprovals > 0}
        />
        <StatCard
          icon={<UserPlus className="size-4" />}
          label={t("hr.hiresThisMonth")}
          value={stats.hiresThisMonth}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount by department */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("hr.headcountByDept")}</CardTitle>
            <CardDescription>{t("hr.headcountByDeptDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            {stats.headcountByDept.length === 0 ? (
              <EmptyChart label={t("hr.noData")} />
            ) : (
              <ChartContainer config={barConfig} className="h-[240px] w-full">
                <BarChart
                  accessibilityLayer
                  data={stats.headcountByDept}
                  layout="vertical"
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={90}
                    tick={{ fontSize: 12 }}
                  />
                  <XAxis dataKey="count" type="number" hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Hires trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("hr.hiresTrend")}</CardTitle>
            <CardDescription>{t("hr.hiresTrendDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <ChartContainer config={areaConfig} className="h-[240px] w-full">
              <AreaChart accessibilityLayer data={hiresData} margin={{ left: 4, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="count"
                  type="monotone"
                  fill="var(--color-count)"
                  fillOpacity={0.2}
                  stroke="var(--color-count)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Leave status distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("hr.leaveStatus")}</CardTitle>
            <CardDescription>{t("hr.leaveStatusDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            {leaveData.length === 0 ? (
              <EmptyChart label={t("hr.noData")} />
            ) : (
              <DonutChart data={leaveData} config={pieConfig} />
            )}
          </CardContent>
        </Card>

        {/* Employment type distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t("hr.employmentType")}</CardTitle>
            <CardDescription>{t("hr.employmentTypeDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            {typeData.length === 0 ? (
              <EmptyChart label={t("hr.noData")} />
            ) : (
              <DonutChart data={typeData} config={pieConfig} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DonutChart({
  data,
  config,
}: {
  data: { name: string; value: number }[];
  config: ChartConfig;
}) {
  return (
    <ChartContainer config={config} className="h-[240px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
        <span className={accent ? "text-primary" : "text-muted-foreground"}>{icon}</span>
      </CardHeader>
      <CardContent className="pb-3">
        <div className={`text-2xl font-bold ${accent ? "text-primary" : ""}`}>{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}
