import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCompanyId } from '@/lib/auth';
import { getDepartmentSchema } from '@/lib/validations/employee';
import { isHrDepartmentName } from '@/lib/access';
import { getTranslations } from 'next-intl/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const companyId = await getCompanyId();
        const { id } = await params;

        const department = await prisma.department.findUnique({
            where: {
                id,
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
            },
        });

        if (!department) {
            const tDepartments = await getTranslations('departments');
            return NextResponse.json(
                { error: tDepartments('notFound') || 'Departman bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json(department);
    } catch (error: any) {
        console.error('Get department error:', error);
        const tDepartments = await getTranslations('departments');
        return NextResponse.json(
            { error: tDepartments('fetchErrorDetail') || 'Departman bilgileri alınırken bir hata oluştu' },
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
        const tValidation = await getTranslations('validation');
        const body = await request.json();
        const { id } = await params;

        const validatedData = getDepartmentSchema(tValidation).parse(body);

        const department = await prisma.department.update({
            where: {
                id,
                companyId,
            },
            data: {
                name: validatedData.name,
                managerId: validatedData.managerId || null,
            },
        });

        return NextResponse.json(department);
    } catch (error: any) {
        console.error('Update department error:', error);
        const tDepartments = await getTranslations('departments');
        return NextResponse.json(
            { error: tDepartments('updateError') || 'Departman güncellenirken bir hata oluştu' },
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

        // Note: The database schema is configured with onDelete: SetNull for Employee.departmentId
        // so we don't need a manual check or manual unlinking.
        const deptToDelete = await prisma.department.findUnique({
            where: { id, companyId }
        });

        if (isHrDepartmentName(deptToDelete?.name)) {
            const tDepartments = await getTranslations('departments');
            return NextResponse.json(
                { error: tDepartments('cannotDeleteHR') || 'İnsan Kaynakları departmanı silinemez' },
                { status: 400 }
            );
        }

        await prisma.department.delete({
            where: {
                id,
                companyId,
            },
        });

        const tDepartments = await getTranslations('departments');
        return NextResponse.json({ message: tDepartments('deleteSuccess') || 'Departman başarıyla silindi' });
    } catch (error: any) {
        console.error('Delete department error:', error);
        const tDepartments = await getTranslations('departments');
        return NextResponse.json(
            { error: tDepartments('deleteError') || 'Departman silinirken bir hata oluştu' },
            { status: 500 }
        );
    }
}
