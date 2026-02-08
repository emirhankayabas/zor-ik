import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getCompanyId } from '@/lib/auth';
import { employeeSchema } from '@/lib/validations/employee';
import { calculateSeniorityQuota } from '@/lib/leave-engine';

export async function GET(request: NextRequest) {
    try {
        const companyId = await getCompanyId();

        const employees = await prisma.employee.findMany({
            where: {
                companyId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(employees);
    } catch (error: any) {
        console.error('Get employees error:', error);
        return NextResponse.json(
            { error: 'Çalışanlar alınırken bir hata oluştu' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const companyId = await getCompanyId();
        const body = await request.json();

        // Validate input
        const validatedData = employeeSchema.parse(body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email: validatedData.email,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Bu e-posta adresi zaten kullanılıyor' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password!, 10);

        // Create user and employee in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email: validatedData.email,
                    password: hashedPassword,
                    name: validatedData.name,
                    role: validatedData.role,
                    companyId,
                },
            });

            // Calculate annual leave quota based on seniority
            const hireDate = validatedData.hireDate ? new Date(validatedData.hireDate) : new Date();
            const quota = calculateSeniorityQuota(hireDate);

            // Create employee record
            const employee = await tx.employee.create({
                data: {
                    userId: user.id,
                    departmentId: validatedData.departmentId || null,
                    position: validatedData.position,
                    companyId,
                    hireDate: hireDate,
                    annualLeaveQuota: quota,
                    totalLeftLeaveDays: quota, // Initial remaining days = initial quota
                    workingDays: validatedData.workingDays || [1, 2, 3, 4, 5],
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                    department: {
                        select: {
                            name: true,
                        },
                    },
                },
            });

            return employee;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        console.error('Create employee error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Geçersiz form verileri' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Çalışan eklenirken bir hata oluştu' },
            { status: 500 }
        );
    }
}
