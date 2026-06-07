import prisma from "@/lib/prisma";

export interface CompanyStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  pendingApprovals: number;
  hiresThisMonth: number;
  headcountByDept: { name: string; count: number }[];
  hiresByMonth: { key: string; count: number }[]; // last 6 months, key = "YYYY-MM"
  leaveStatusDist: { status: string; count: number }[];
  employmentTypeDist: { type: string; count: number }[];
}

/**
 * Company-wide HR analytics for the manager dashboard. All queries are scoped
 * to companyId and run in parallel to avoid request waterfalls.
 */
export async function getCompanyStats(companyId: string): Promise<CompanyStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  // First day of the month 5 months ago → 6-month window inclusive.
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    employees,
    totalDepartments,
    pendingLeaves,
    pendingCorrections,
    leaveStatusGroups,
  ] = await Promise.all([
    prisma.employee.findMany({
      where: { companyId },
      select: {
        hireDate: true,
        employmentType: true,
        department: { select: { name: true } },
        user: { select: { isActive: true } },
      },
    }),
    prisma.department.count({ where: { companyId } }),
    prisma.leaveRequest.count({ where: { companyId, status: "PENDING" } }),
    prisma.attendanceCorrection.count({
      where: { companyId, status: "PENDING" },
    }),
    prisma.leaveRequest.groupBy({
      by: ["status"],
      where: { companyId, createdAt: { gte: startOfYear } },
      _count: { _all: true },
    }),
  ]);

  const activeEmployees = employees.filter((e) => e.user.isActive).length;
  const hiresThisMonth = employees.filter(
    (e) => e.hireDate >= startOfMonth,
  ).length;

  // Headcount by department (top to bottom by size).
  const deptMap = new Map<string, number>();
  for (const e of employees) {
    const name = e.department?.name ?? "—";
    deptMap.set(name, (deptMap.get(name) ?? 0) + 1);
  }
  const headcountByDept = [...deptMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Hires over the last 6 months (pre-seed all buckets so gaps render as 0).
  const monthBuckets = new Map<string, number>();
  for (let i = 0; i < 6; i++) {
    const d = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
    monthBuckets.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, 0);
  }
  for (const e of employees) {
    if (e.hireDate < sixMonthsAgo) continue;
    const key = `${e.hireDate.getFullYear()}-${String(e.hireDate.getMonth() + 1).padStart(2, "0")}`;
    if (monthBuckets.has(key)) monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + 1);
  }
  const hiresByMonth = [...monthBuckets.entries()].map(([key, count]) => ({
    key,
    count,
  }));

  // Employment type distribution (null → FULL_TIME default for display).
  const typeMap = new Map<string, number>();
  for (const e of employees) {
    const type = e.employmentType ?? "FULL_TIME";
    typeMap.set(type, (typeMap.get(type) ?? 0) + 1);
  }
  const employmentTypeDist = [...typeMap.entries()].map(([type, count]) => ({
    type,
    count,
  }));

  const leaveStatusDist = leaveStatusGroups.map((g) => ({
    status: g.status,
    count: g._count._all,
  }));

  return {
    totalEmployees: employees.length,
    activeEmployees,
    totalDepartments,
    pendingApprovals: pendingLeaves + pendingCorrections,
    hiresThisMonth,
    headcountByDept,
    hiresByMonth,
    leaveStatusDist,
    employmentTypeDist,
  };
}
