import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { isHrUser } from '@/lib/access';
import { handleApiError } from '@/lib/api-response';

// PATCH /api/employees/[id]/salary - Set or update employee salary
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerAuthSession();

        if (!session || !isHrUser(session.user)) {
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
    } catch (error) {
        return handleApiError(error);
    }
}
