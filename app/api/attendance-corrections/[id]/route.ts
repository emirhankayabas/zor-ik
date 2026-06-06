import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { canManageCompany } from '@/lib/access';
import { handleApiError } from '@/lib/api-response';

// GET /api/attendance-corrections/[id] - Get a single attendance correction request
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

        const correction = await prisma.attendanceCorrection.findUnique({
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

        // Multi-tenant izolasyonu
        if (!correction || correction.companyId !== session.user.companyId) {
            return NextResponse.json({ error: 'Attendance correction not found' }, { status: 404 });
        }

        // Erişim: kaydın sahibi VEYA şirket yönetimi yetkisi olan (İK/yönetici)
        const isOwner = correction.employee.userId === session.user.id;
        if (!isOwner && !canManageCompany(session.user)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(correction);
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE /api/attendance-corrections/[id] - Delete/Cancel an attendance correction request (only if PENDING)
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

        const existing = await prisma.attendanceCorrection.findUnique({
            where: { id },
            include: { employee: true }
        });

        if (!existing || existing.companyId !== session.user.companyId) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Check ownership or admin role
        if (existing.employee.userId !== session.user.id && !['COMPANY_ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Only allow deleting PENDING requests
        if (existing.status !== 'PENDING') {
            return NextResponse.json({ error: 'Sadece beklemedeki talepler iptal edilebilir.' }, { status: 400 });
        }

        // Success: Delete the correction. Cascade will handle approvals.
        await prisma.attendanceCorrection.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'İşlem başarıyla iptal edildi.' });
    } catch (error) {
        return handleApiError(error);
    }
}
