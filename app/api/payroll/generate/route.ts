import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateNetFromGross } from '@/lib/payroll-engine';

// POST /api/payroll/generate - Generate payroll for all employees
export async function POST(request: NextRequest) {
    try {
        const session = await getServerAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user with department to verify HR status better if needed
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { employee: { include: { department: true } } }
        });

        const isHR = user?.role === 'COMPANY_ADMIN' ||
            user?.role === 'SUPER_ADMIN' ||
            user?.employee?.department?.name === 'İK' ||
            user?.employee?.department?.name === 'İnsan Kaynakları';

        if (!isHR) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { month, year } = await request.json();

        if (!month || !year) {
            return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
        }

        // Fetch all employees in the company with their salary info
        const employees = await prisma.employee.findMany({
            where: {
                companyId: session.user.companyId,
            },
            include: {
                salary: true,
                user: true,
            },
        });

        const results = [];

        for (const employee of employees) {
            if (!employee.salary) continue;

            const pastPayrolls = await prisma.payroll.findMany({
                where: {
                    employeeId: employee.id,
                    year: year,
                    month: {
                        lt: month,
                    },
                },
            });

            const cumulativeMatrah = pastPayrolls.reduce((sum: number, p: any) => sum + p.incomeTaxMatrah, 0);

            // Calculate payroll
            const payrollData = calculateNetFromGross(employee.salary.baseSalary, cumulativeMatrah);

            // Upsert payroll record
            await prisma.payroll.upsert({
                where: {
                    employeeId_month_year: {
                        employeeId: employee.id,
                        month: month,
                        year: year,
                    },
                },
                update: {
                    grossSalary: payrollData.grossSalary,
                    netSalary: payrollData.netSalary,
                    sgkEmployee: payrollData.sgkEmployee,
                    unemployment: payrollData.unemploymentEmployee,
                    sgkEmployer: payrollData.sgkEmployer,
                    unemploymentEmployer: payrollData.unemploymentEmployer,
                    totalEmployerCost: payrollData.totalEmployerCost,
                    taxRate: payrollData.taxRate,
                    incomeTax: payrollData.incomeTax,
                    stampTax: payrollData.stampTax,
                    taxExemption: payrollData.taxExemption,
                    incomeTaxMatrah: payrollData.incomeTaxMatrah,
                },
                create: {
                    employeeId: employee.id,
                    month,
                    year,
                    grossSalary: payrollData.grossSalary,
                    netSalary: payrollData.netSalary,
                    sgkEmployee: payrollData.sgkEmployee,
                    unemployment: payrollData.unemploymentEmployee,
                    sgkEmployer: payrollData.sgkEmployer,
                    unemploymentEmployer: payrollData.unemploymentEmployer,
                    totalEmployerCost: payrollData.totalEmployerCost,
                    taxRate: payrollData.taxRate,
                    incomeTax: payrollData.incomeTax,
                    stampTax: payrollData.stampTax,
                    taxExemption: payrollData.taxExemption,
                    incomeTaxMatrah: payrollData.incomeTaxMatrah,
                },
            });

            results.push({
                employeeName: employee.user.name,
                netSalary: payrollData.netSalary,
            });
        }

        return NextResponse.json({
            message: `${results.length} person için bordro başarıyla oluşturuldu.`,
            results,
        });
    } catch (error: any) {
        console.error('Bordro oluşturma hatası:', error);
        return NextResponse.json(
            { error: error.message || 'Bordro oluşturulamadı' },
            { status: 500 }
        );
    }
}
