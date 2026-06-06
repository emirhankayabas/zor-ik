import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCompanyId } from '@/lib/auth';
import { getDepartmentSchema } from '@/lib/validations/employee';
import { handleApiError } from '@/lib/api-response';
import { getTranslations } from 'next-intl/server';

export async function GET(request: NextRequest) {
    try {
        const companyId = await getCompanyId();

        const departments = await prisma.department.findMany({
            where: {
                companyId,
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        employees: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(departments);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const companyId = await getCompanyId();
        const tValidation = await getTranslations('validation');
        const body = await request.json();

        // Validate input
        const validatedData = getDepartmentSchema(tValidation).parse(body);

        // Create department
        const department = await prisma.department.create({
            data: {
                name: validatedData.name,
                managerId: validatedData.managerId,
                companyId,
            },
            include: {
                manager: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(department, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
