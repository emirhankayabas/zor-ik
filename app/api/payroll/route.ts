import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/api-response';

// GET /api/payroll?month=2&year=2025 - Fetch payrolls
export async function GET(request: NextRequest) {
    try {
        const session = await getServerAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get('month') || '');
        const year = parseInt(searchParams.get('year') || '');

        if (!month || !year) {
            return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
        }

        const rawPayrolls = await (prisma as any).payroll.findMany({
            where: {
                month,
                year,
                employee: {
                    companyId: session.user.companyId
                }
            },
            include: {
                employee: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            }
                        }
                    }
                }
            }
        });

        const payrolls = rawPayrolls.map((p: any) => ({
            ...p,
            unemploymentEmployee: p.unemployment, // Map DB field to UI/Engine field
            agi: p.agi || 0,
            totalSalary: p.totalSalary || p.netSalary,
        }));

        // Calculate stats
        const stats = payrolls.reduce((acc: any, p: any) => ({
            totalGross: acc.totalGross + p.grossSalary,
            totalNet: acc.totalNet + p.netSalary,
            totalSgk: acc.totalSgk + p.sgkEmployee + p.unemploymentEmployee,
            totalTax: acc.totalTax + p.incomeTax + p.stampTax,
        }), { totalGross: 0, totalNet: 0, totalSgk: 0, totalTax: 0 });

        return NextResponse.json({
            payrolls,
            stats
        });
    } catch (error) {
        return handleApiError(error);
    }
}
