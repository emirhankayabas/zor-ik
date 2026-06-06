import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { applyCorrection } from '@/lib/pdks-engine';
import { ApprovalStatus } from '@prisma/client';
import { handleApiError } from '@/lib/api-response';

// POST /api/attendance-corrections/[id]/approve - Approve correction request
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerAuthSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { action, comment } = await request.json();

        if (!['APPROVED', 'REJECTED'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Find the approval for this user
        const approval = await prisma.approval.findFirst({
            where: {
                attendanceCorrectionId: id,
                approverId: session.user.id,
                status: 'PENDING',
            },
            include: {
                attendanceCorrection: {
                    include: {
                        employee: true
                    }
                },
            },
        });

        if (!approval || !approval.attendanceCorrection) {
            return NextResponse.json(
                { error: 'Approval not found or already processed' },
                { status: 404 }
            );
        }

        // Multi-tenant güvenliği: yalnızca aynı şirket
        if (approval.attendanceCorrection.companyId !== session.user.companyId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Onay sırasını server tarafında zorla: yönetici onaylamadan İK işlem yapamaz.
        const priorStepPending = await prisma.approval.findFirst({
            where: {
                attendanceCorrectionId: id,
                approvalOrder: { lt: approval.approvalOrder },
                status: { not: 'APPROVED' },
            },
        });

        if (priorStepPending) {
            return NextResponse.json(
                { error: 'Önceki onay adımı tamamlanmadan işlem yapılamaz.' },
                { status: 400 }
            );
        }

        // Update approval status
        await prisma.approval.update({
            where: { id: approval.id },
            data: {
                status: action as ApprovalStatus,
                comment: comment || null,
            },
        });

        if (action === 'REJECTED') {
            // If rejected, reject the entire request
            await prisma.attendanceCorrection.update({
                where: { id },
                data: { status: 'REJECTED' },
            });

            // Notify Employee about rejection
            await prisma.notification.create({
                data: {
                    userId: approval.attendanceCorrection.employee.userId,
                    companyId: approval.attendanceCorrection.companyId,
                    title: 'Düzeltme Talebi Reddedildi',
                    message: `Giriş/çıkış düzeltme talebiniz ${session.user.name} tarafından reddedildi.${comment ? ` Sebep: ${comment}` : ''}`,
                    link: `/dashboard/attendance`, // To be created
                }
            });
        } else {
            // Check if all approvals are done
            const allApprovals = await prisma.approval.findMany({
                where: { attendanceCorrectionId: id },
            });

            const allApproved = allApprovals.every((a) => a.status === 'APPROVED');

            if (allApproved) {
                // All approvals done, final approval
                await prisma.attendanceCorrection.update({
                    where: { id },
                    data: { status: 'APPROVED' },
                });

                // Apply correction to PDKS attendance log
                try {
                    await applyCorrection(id);
                } catch (pdksError) {
                    console.error('PDKS correction apply failed:', pdksError);
                    // Non-blocking: approval succeeds even if PDKS update fails
                }

                // Final Approval Notification
                await prisma.notification.create({
                    data: {
                        userId: approval.attendanceCorrection.employee.userId,
                        companyId: approval.attendanceCorrection.companyId,
                        title: 'Düzeltme Talebi Onaylandı',
                        message: `Giriş/çıkış düzeltme talebiniz nihai olarak onaylanmıştır.`,
                        link: `/dashboard/attendance`,
                    }
                });
            } else {
                // Partial Approval (usually Manager approved, HR pending)
                await prisma.attendanceCorrection.update({
                    where: { id },
                    data: { status: 'MANAGER_APPROVED' },
                });

                await prisma.notification.create({
                    data: {
                        userId: approval.attendanceCorrection.employee.userId,
                        companyId: approval.attendanceCorrection.companyId,
                        title: 'Düzeltme Talebi Güncellemesi',
                        message: 'Departman yöneticiniz talebinizi onayladı, İK onayı bekleniyor.',
                        link: `/dashboard/attendance`,
                    }
                });

                // Notify HR (Step 2 approvers)
                const nextApprovals = allApprovals.filter(a => a.approvalOrder === 2 && a.status === 'PENDING');
                for (const hrApproval of nextApprovals) {
                    await prisma.notification.create({
                        data: {
                            userId: hrApproval.approverId,
                            companyId: approval.attendanceCorrection.companyId,
                            title: 'Onay Bekleyen Düzeltme Talebi',
                            message: `${session.user.name} bir düzeltme talebine onay verdi. Şimdi sizin onayınız bekleniyor.`,
                            link: `/dashboard/hr/attendance-requests`,
                        }
                    });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
