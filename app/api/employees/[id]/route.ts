import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCompanyId } from '@/lib/auth';
import { getEmployeeSchema } from '@/lib/validations/employee';
import { getTranslations } from 'next-intl/server';
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
                shift: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!employee) {
            const tEmployees = await getTranslations('employees');
            return NextResponse.json(
                { error: tEmployees('notFound') || 'Çalışan bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json(employee);
    } catch (error: any) {
        console.error('Get employee error:', error);
        const tEmployees = await getTranslations('employees');
        return NextResponse.json(
            { error: tEmployees('fetchErrorDetail') || 'Çalışan bilgileri alınırken bir hata oluştu' },
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
            const tEmployees = await getTranslations('employees');
            return NextResponse.json({ error: tEmployees('notFound') || 'Çalışan bulunamadı' }, { status: 404 });
        }

        const { password, name, email, role, position, departmentId, shiftId, workingDays, isActive, ...rest } = body;

        // Update in transaction
        await prisma.$transaction(async (tx: any) => {
            // Update user record if user-related fields are provided
            if (name || email || role || password || isActive !== undefined) {
                await tx.user.update({
                    where: { id: employee.userId },
                    data: {
                        ...(name && { name }),
                        ...(email && { email }),
                        ...(role && { role }),
                        ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
                        ...(isActive !== undefined ? { isActive } : {}),
                    }
                });
            }

            // Update employee record
            const employeeUpdate: any = {};
            if (position !== undefined) employeeUpdate.position = position;
            if (departmentId !== undefined) employeeUpdate.departmentId = departmentId;
            if (shiftId !== undefined) employeeUpdate.shiftId = shiftId || null;
            if (workingDays !== undefined) employeeUpdate.workingDays = workingDays;

            if (Object.keys(employeeUpdate).length > 0) {
                await tx.employee.update({
                    where: { id },
                    data: employeeUpdate,
                });
            }
        });

        const tEmployees = await getTranslations('employees');
        return NextResponse.json({ message: tEmployees('updateSuccess') || 'Çalışan başarıyla güncellendi' });
    } catch (error: any) {
        console.error('Update employee error:', error);
        const tEmployees = await getTranslations('employees');
        return NextResponse.json(
            { error: tEmployees('updateError') || 'Çalışan güncellenirken bir hata oluştu' },
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
            const tEmployees = await getTranslations('employees');
            return NextResponse.json({ error: tEmployees('notFound') || 'Çalışan bulunamadı' }, { status: 404 });
        }

        // Delete user (cascade will handle employee)
        await prisma.user.delete({
            where: { id: employee.userId }
        });

        const tEmployees = await getTranslations('employees');
        return NextResponse.json({ message: tEmployees('deleteSuccess') || 'Çalışan başarıyla silindi' });
    } catch (error: any) {
        console.error('Delete employee error:', error);
        const tEmployees = await getTranslations('employees');
        return NextResponse.json(
            { error: tEmployees('deleteError') || 'Çalışan silinirken bir hata oluştu' },
            { status: 500 }
        );
    }
}
