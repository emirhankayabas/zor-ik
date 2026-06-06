import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApprovalStatus } from '@prisma/client';
import { handleApiError } from '@/lib/api-response';

// POST /api/leave-requests/[id]/approve - Approve leave request
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
                leaveRequestId: id,
                approverId: session.user.id,
                status: 'PENDING',
            },
            include: {
                leaveRequest: {
                    include: {
                        employee: true
                    }
                },
            },
        });

        if (!approval || !approval.leaveRequest) {
            return NextResponse.json(
                { error: 'Approval request or associated leave request not found' },
                { status: 404 }
            );
        }

        // Multi-tenant güvenliği: yalnızca aynı şirket
        if (approval.leaveRequest.companyId !== session.user.companyId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Onay sırasını server tarafında zorla: daha düşük sıradaki (örn. yönetici)
        // adımlar onaylanmadan sonraki adım (İK) işlem yapamaz.
        const priorStepPending = await prisma.approval.findFirst({
            where: {
                leaveRequestId: id,
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
            // If rejected, reject the entire leave request
            await prisma.leaveRequest.update({
                where: { id },
                data: { status: 'REJECTED' },
            });

            // Notify Employee about rejection
            await prisma.notification.create({
                data: {
                    userId: approval.leaveRequest.employee.userId,
                    companyId: approval.leaveRequest.companyId,
                    title: 'İzin Talebi Reddedildi',
                    message: `İzin talebiniz ${session.user.name} tarafından reddedildi.${comment ? ` Sebep: ${comment}` : ''}`,
                    link: `/dashboard/leaves/${id}`,
                }
            });
        } else {
            // Check if all approvals are done
            const allApprovals = await prisma.approval.findMany({
                where: { leaveRequestId: id },
            });

            const allApproved = allApprovals.every((a) => a.status === 'APPROVED');

            if (allApproved) {
                // All approvals done, approve the leave request and deduct quota if it's Annual Leave
                await prisma.$transaction(async (tx) => {
                    const updatedRequest = await tx.leaveRequest.update({
                        where: { id },
                        data: { status: 'APPROVED' },
                        include: {
                            leaveType: true,
                            employee: true
                        }
                    });

                    // Deduct from quota only if it's "Yıllık İzin"
                    if (updatedRequest.leaveType.name === 'Yıllık İzin') {
                        await tx.employee.update({
                            where: { id: updatedRequest.employeeId },
                            data: {
                                totalLeftLeaveDays: {
                                    decrement: updatedRequest.actualDays
                                }
                            }
                        });
                    }
                });

                // Final Approval Notification
                await prisma.notification.create({
                    data: {
                        userId: approval.leaveRequest.employee.userId,
                        companyId: approval.leaveRequest.companyId,
                        title: 'İzin Talebi Onaylandı',
                        message: `İzin talebiniz nihai olarak onaylanmıştır (${approval.leaveRequest.actualDays} gün). İyi tatiller!`,
                        link: `/dashboard/leaves/${id}`,
                    }
                });
            } else {
                // Partial Approval Notification (Manager approved, HR pending usually)
                await prisma.notification.create({
                    data: {
                        userId: approval.leaveRequest.employee.userId,
                        companyId: approval.leaveRequest.companyId,
                        title: 'İzin Talebi Güncellemesi',
                        message: 'Departman yöneticiniz izin talebinizi onayladı, İK onayı bekleniyor.',
                        link: `/dashboard/leaves/${id}`,
                    }
                });

                // Notify HR (Step 2 approvers)
                const nextApprovals = allApprovals.filter(a => a.approvalOrder === 2 && a.status === 'PENDING');
                for (const hrApproval of nextApprovals) {
                    await prisma.notification.create({
                        data: {
                            userId: hrApproval.approverId,
                            companyId: approval.leaveRequest.companyId,
                            title: 'Onay Bekleyen İzin',
                            message: `${session.user.name} bir izin talebine onay verdi. Şimdi sizin onayınız bekleniyor.`,
                            link: `/dashboard/leaves/${id}`,
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
