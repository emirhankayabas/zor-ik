import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH /api/employees/[id]/salary - Set or update employee salary
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerAuthSession();
        const isHR = session?.user?.role === 'COMPANY_ADMIN' ||
            session?.user?.departmentName === 'İK' ||
            session?.user?.departmentName === 'İnsan Kaynakları';

        if (!session || !isHR) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { baseSalary, currency } = await request.json();

        if (typeof baseSalary !== 'number' || baseSalary < 0) {
            return NextResponse.json({ error: 'Valid gross salary is required' }, { status: 400 });
        }

        const updatedSalary = await prisma.salary.upsert({
            where: {
                employeeId: id,
            },
            update: {
                baseSalary: baseSalary,
                currency: currency || 'TRY',
            },
            create: {
                employeeId: id,
                baseSalary: baseSalary,
                currency: currency || 'TRY',
            },
        });

        return NextResponse.json(updatedSalary);
    } catch (error: any) {
        console.error('Salary update error:', error);
        return NextResponse.json(
            { error: error.message || 'Could not update salary' },
            { status: 500 }
        );
    }
}
