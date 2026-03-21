import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCompanyId } from '@/lib/auth';
import { getDepartmentSchema } from '@/lib/validations/employee';
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
    } catch (error: any) {
        console.error('Get departments error:', error);
        const tDepartments = await getTranslations('departments');
        return NextResponse.json(
            { error: tDepartments('fetchError') || 'Departmanlar alınırken bir hata oluştu' },
            { status: 500 }
        );
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
    } catch (error: any) {
        console.error('Create department error:', error);

        const tDepartmentsCatch = await getTranslations('departments');
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: tDepartmentsCatch('invalidData') || 'Geçersiz form verileri' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: tDepartmentsCatch('createError') || 'Departman oluşturulurken bir hata oluştu' },
            { status: 500 }
        );
    }
}
