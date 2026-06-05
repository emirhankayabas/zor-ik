import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getLeaveRequestSchema } from '@/lib/validations/employee';
import { canManageCompany } from '@/lib/access';
import { getTranslations } from 'next-intl/server';

// GET /api/leave-requests/[id] - Get a single leave request
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id },
            include: {
                employee: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        },
                        department: {
                            select: { name: true }
                        }
                    }
                },
                leaveType: true,
                approvals: {
                    include: {
                        approver: {
                            select: {
                                name: true,
                                email: true,
                                role: true,
                                managedDepts: {
                                    select: { name: true }
                                }
                            }
                        }
                    },
                    orderBy: { approvalOrder: 'asc' }
                }
            }
        });

        // Multi-tenant izolasyonu: farklı şirketin kaydı görünmesin
        if (!leaveRequest || leaveRequest.companyId !== session.user.companyId) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        // Erişim: kaydın sahibi VEYA şirket yönetimi yetkisi olan (İK/yönetici)
        const isOwner = leaveRequest.employee.userId === session.user.id;
        if (!isOwner && !canManageCompany(session.user)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(leaveRequest);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/leave-requests/[id] - Update a leave request (only if PENDING)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const existing = await prisma.leaveRequest.findUnique({
            where: { id },
            include: { employee: true }
        });

        if (!existing || existing.companyId !== session.user.companyId) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        if (existing.employee.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (existing.status !== 'PENDING') {
            return NextResponse.json({ error: 'Cannot update non-pending requests' }, { status: 400 });
        }

        const tValidation = await getTranslations('validation');
        const body = await request.json();
        const validatedData = getLeaveRequestSchema(tValidation).parse(body);

        const updated = await prisma.leaveRequest.update({
            where: { id },
            data: {
                leaveTypeId: validatedData.leaveTypeId,
                startDate: new Date(validatedData.startDate),
                endDate: new Date(validatedData.endDate),
                reason: validatedData.reason,
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/leave-requests/[id] - Delete/Cancel a leave request (only if PENDING)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerAuthSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const existing = await prisma.leaveRequest.findUnique({
            where: { id },
            include: { employee: true }
        });

        if (!existing || existing.companyId !== session.user.companyId) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        if (existing.employee.userId !== session.user.id && session.user.role !== 'COMPANY_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (existing.status !== 'PENDING') {
            return NextResponse.json({ error: 'Cannot delete processed requests' }, { status: 400 });
        }

        await prisma.leaveRequest.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
