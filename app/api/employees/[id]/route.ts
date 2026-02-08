import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCompanyId } from '@/lib/auth';
import { employeeSchema } from '@/lib/validations/employee';
import bcrypt from 'bcryptjs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const companyId = await getCompanyId();
        const { id } = await params;

        const employee = await prisma.employee.findUnique({
            where: {
                id,
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
        });

        if (!employee) {
            return NextResponse.json(
                { error: 'Çalışan bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json(employee);
    } catch (error: any) {
        console.error('Get employee error:', error);
        return NextResponse.json(
            { error: 'Çalışan bilgileri alınırken bir hata oluştu' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const companyId = await getCompanyId();
        const body = await request.json();
        const { id } = await params;

        const employee = await prisma.employee.findUnique({
            where: { id, companyId },
            include: { user: true }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Çalışan bulunamadı' }, { status: 404 });
        }

        const { password, name, email, role, position, departmentId, ...rest } = body;

        // Update in transaction
        await prisma.$transaction(async (tx: any) => {
            // Update user record if user-related fields are provided
            if (name || email || role || password) {
                await tx.user.update({
                    where: { id: employee.userId },
                    data: {
                        ...(name && { name }),
                        ...(email && { email }),
                        ...(role && { role }),
                        ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
                    }
                });
            }

            // Update employee record
            // We check undefined to allow setting departmentId to null
            if (position !== undefined || departmentId !== undefined) {
                await tx.employee.update({
                    where: { id },
                    data: {
                        ...(position !== undefined && { position }),
                        ...(departmentId !== undefined && { departmentId }),
                    }
                });
            }
        });

        return NextResponse.json({ message: 'Çalışan başarıyla güncellendi' });
    } catch (error: any) {
        console.error('Update employee error:', error);
        return NextResponse.json(
            { error: 'Çalışan güncellenirken bir hata oluştu' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const companyId = await getCompanyId();
        const { id } = await params;

        const employee = await prisma.employee.findUnique({
            where: { id, companyId }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Çalışan bulunamadı' }, { status: 404 });
        }

        // Delete user (cascade will handle employee)
        await prisma.user.delete({
            where: { id: employee.userId }
        });

        return NextResponse.json({ message: 'Çalışan başarıyla silindi' });
    } catch (error: any) {
        console.error('Delete employee error:', error);
        return NextResponse.json(
            { error: 'Çalışan silinirken bir hata oluştu' },
            { status: 500 }
        );
    }
}
