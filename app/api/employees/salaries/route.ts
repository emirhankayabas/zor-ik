import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { isHrUser } from '@/lib/access';
import { handleApiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerAuthSession();

        if (!session || !isHrUser(session.user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const employees = await prisma.employee.findMany({
            where: {
                companyId: session.user.companyId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                department: {
                    select: {
                        name: true,
                    }
                },
                salary: true,
            },
            orderBy: {
                user: {
                    name: 'asc'
                }
            }
        });

        return NextResponse.json(employees);
    } catch (error) {
        return handleApiError(error);
    }
}
