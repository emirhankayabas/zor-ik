import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCompanyId } from '@/lib/auth';
import { departmentSchema } from '@/lib/validations/employee';

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
        return NextResponse.json(
            { error: 'Departmanlar alınırken bir hata oluştu' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const companyId = await getCompanyId();
        const body = await request.json();

        // Validate input
        const validatedData = departmentSchema.parse(body);

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

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Geçersiz form verileri' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Departman oluşturulurken bir hata oluştu' },
            { status: 500 }
        );
    }
}
