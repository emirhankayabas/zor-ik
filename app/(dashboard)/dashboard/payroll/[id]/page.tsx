import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Payslip } from "./_components/payslip";

export default async function PayslipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerAuthSession();
  if (!session) return null;

  // Multi-tenant: yalnızca aynı şirketin bordrosu
  const payroll = await prisma.payroll.findFirst({
    where: { id, employee: { companyId: session.user.companyId } },
    include: {
      employee: {
        include: {
          user: { select: { name: true, email: true } },
          department: { select: { name: true } },
          company: { select: { name: true } },
        },
      },
    },
  });

  if (!payroll) notFound();

  // Erişim: İK / yönetici herkesinkini, normal çalışan yalnızca kendi bordrosunu görür
  const role = session.user.role;
  const dept = session.user.departmentName;
  const isPrivileged =
    role === "COMPANY_ADMIN" ||
    role === "SUPER_ADMIN" ||
    role === "MANAGER" ||
    dept === "İK" ||
    dept === "İnsan Kaynakları";

  if (!isPrivileged && payroll.employee.userId !== session.user.id) {
    notFound();
  }

  const tPayroll = await getTranslations("payroll");

  const data = {
    companyName: payroll.employee.company?.name ?? "—",
    employeeName: payroll.employee.user.name ?? "—",
    employeeEmail: payroll.employee.user.email ?? "",
    position: payroll.employee.position ?? "—",
    departmentName: payroll.employee.department?.name ?? "—",
    hireDate: payroll.employee.hireDate.toISOString(),
    periodLabel: `${tPayroll(`months.${payroll.month}`)} ${payroll.year}`,
    grossSalary: payroll.grossSalary,
    sgkEmployee: payroll.sgkEmployee,
    unemployment: payroll.unemployment,
    incomeTax: payroll.incomeTax,
    stampTax: payroll.stampTax,
    taxExemption: payroll.taxExemption,
    netSalary: payroll.netSalary,
    sgkEmployer: payroll.sgkEmployer,
    unemploymentEmployer: payroll.unemploymentEmployer,
    totalEmployerCost: payroll.totalEmployerCost,
    calculatedAt: payroll.calculatedAt.toISOString(),
  };

  return <Payslip data={data} />;
}
