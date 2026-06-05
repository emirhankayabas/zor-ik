import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getLeaveRequestSchema } from '@/lib/validations/employee';
import { calculateLeaveDays } from '@/lib/leave-engine';
import { isHrUser, HR_DEPARTMENT_NAMES } from '@/lib/access';
import { getTranslations } from 'next-intl/server';

// GET /api/leave-requests - Get leave requests (filtered by role)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerAuthSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const personalOnly = searchParams.get('personal') === 'true';
        const filterEmployeeId = searchParams.get('employeeId');

        const employee = await prisma.employee.findFirst({
            where: {
                userId: session.user.id,
            },
            include: {
                department: true,
            },
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        const isAdmin = isHrUser({ role: session.user.role, departmentName: employee.department?.name });

        let leaveRequests;

        // Filter based on role and department
        if (!personalOnly && isAdmin) {
            // HR sees all requests for their company (optionally filtered by employeeId)
            leaveRequests = await prisma.leaveRequest.findMany({
                where: {
                    ...(filterEmployeeId ? { employeeId: filterEmployeeId } : {}),
                    employee: {
                        companyId: session.user.companyId,
                    },
                },
                include: {
                    employee: {
                        select: {
                            id: true,
                            totalLeftLeaveDays: true,
                            annualLeaveQuota: true,
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                            department: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    leaveType: true,
                    approvals: {
                        include: {
                            approver: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    managedDepts: {
                                        select: { name: true }
                                    }
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        } else if (!personalOnly && session.user.role === 'MANAGER') {
            // Managers see their own requests + requests from their department
            leaveRequests = await prisma.leaveRequest.findMany({
                where: {
                    OR: [
                        { employeeId: employee.id },
                        {
                            employee: {
                                departmentId: employee.departmentId || '',
                            },
                        },
                    ],
                },
                include: {
                    employee: {
                        select: {
                            id: true,
                            totalLeftLeaveDays: true,
                            annualLeaveQuota: true,
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                            department: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    leaveType: true,
                    approvals: {
                        include: {
                            approver: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    managedDepts: {
                                        select: { name: true }
                                    }
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        } else {
            // Employees see only their own requests
            leaveRequests = await prisma.leaveRequest.findMany({
                where: {
                    employeeId: employee.id,
                },
                include: {
                    employee: {
                        select: {
                            id: true,
                            totalLeftLeaveDays: true,
                            annualLeaveQuota: true,
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                            department: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    leaveType: true,
                    approvals: {
                        include: {
                            approver: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    managedDepts: {
                                        select: { name: true }
                                    }
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }

        return NextResponse.json(leaveRequests);
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leave requests' },
            { status: 500 }
        );
    }
}

// POST /api/leave-requests - Create new leave request
export async function POST(request: NextRequest) {
    try {
        const session = await getServerAuthSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tValidation = await getTranslations('validation');
        const tLeaves = await getTranslations('leaves');
        const body = await request.json();
        const validatedData = getLeaveRequestSchema(tValidation).parse(body);

        const startDate = new Date(validatedData.startDate);
        const endDate = new Date(validatedData.endDate);

        const employee = await prisma.employee.findFirst({
            where: {
                userId: session.user.id,
            },
            include: {
                department: {
                    include: {
                        manager: true,
                    },
                },
            },
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        // Fetch holidays for the period
        const holidays = await prisma.holiday.findMany({
            where: {
                companyId: session.user.companyId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        // Calculate actual leave days using the engine
        const actualDays = calculateLeaveDays(
            startDate,
            endDate,
            employee.workingDays,
            holidays as any
        );

        if (actualDays === 0) {
            return NextResponse.json({ error: tLeaves('noBusinessDaysError') || 'Seçilen tarihlerde iş günü bulunamadı.' }, { status: 400 });
        }

        // Check for overlapping leave requests
        const overlappingRequest = await prisma.leaveRequest.findFirst({
            where: {
                employeeId: employee.id,
                status: {
                    in: ['PENDING', 'APPROVED']
                },
                OR: [
                    {
                        startDate: { lte: endDate },
                        endDate: { gte: startDate }
                    }
                ]
            }
        });

        if (overlappingRequest) {
            return NextResponse.json({
                error: tLeaves('overlappingRequestError') || 'Seçilen tarihlerde zaten onaylanmış veya bekleyen bir izin talebiniz bulunuyor.'
            }, { status: 400 });
        }

        // Check quota if it's an Annual Leave (Yıllık İzin)
        const leaveType = await prisma.leaveType.findUnique({
            where: { id: validatedData.leaveTypeId }
        });

        if (leaveType?.name === 'Yıllık İzin' && actualDays > (employee.totalLeftLeaveDays + 5)) {
            return NextResponse.json({
                error: tLeaves('insufficientQuotaDetail', { 
                    remaining: employee.totalLeftLeaveDays, 
                    requested: actualDays 
                }) || `Yetersiz izin kotası. Mevcut bakiyenizle en fazla -5 güne kadar borçlanabilirsiniz. Kalan: ${employee.totalLeftLeaveDays} gün, Talep edilen: ${actualDays} gün.`
            }, { status: 400 });
        }

        // Create leave request
        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                employeeId: employee.id,
                leaveTypeId: validatedData.leaveTypeId,
                startDate: startDate,
                endDate: endDate,
                actualDays: actualDays, // NEW
                reason: validatedData.reason,
                status: 'PENDING',
                companyId: session.user.companyId,
            },
        });

        // Create approval workflow: Employee -> Manager -> HR
        const approvals = [];

        // Step 1: Manager approval (if employee has a manager)
        if (employee.department?.managerId && employee.department.managerId !== employee.userId) {
            approvals.push({
                leaveRequestId: leaveRequest.id,
                approverId: employee.department.managerId,
                approvalOrder: 1,
            });
        }

        // Step 2: HR approval
        // Priority: İK dept manager → any İK dept MANAGER → any COMPANY_ADMIN → any other MANAGER
        let hrAdminId = null;

        const hrDept = await prisma.department.findFirst({
            where: {
                name: { in: HR_DEPARTMENT_NAMES },
                companyId: session.user.companyId
            }
        });

        if (hrDept?.managerId) {
            hrAdminId = hrDept.managerId;
        } else if (hrDept) {
            const hrMember = await prisma.employee.findFirst({
                where: {
                    departmentId: hrDept.id,
                    user: { role: { in: ['MANAGER', 'COMPANY_ADMIN'] } },
                },
                select: { userId: true },
            });
            hrAdminId = hrMember?.userId || null;
        }

        if (!hrAdminId) {
            const firstAdmin = await prisma.user.findFirst({
                where: {
                    role: 'COMPANY_ADMIN',
                    companyId: session.user.companyId,
                },
            });
            hrAdminId = firstAdmin?.id || null;
        }

        if (!hrAdminId) {
            const anyManager = await prisma.user.findFirst({
                where: {
                    role: 'MANAGER',
                    companyId: session.user.companyId,
                    id: {
                        notIn: [
                            employee.userId,
                            ...(approvals.length > 0 ? [approvals[0].approverId] : []),
                        ],
                    },
                },
            });
            hrAdminId = anyManager?.id || null;
        }

        if (hrAdminId &&
            hrAdminId !== employee.userId && // Don't approve your own leave
            !approvals.some(a => a.approverId === hrAdminId) // Don't add same person twice
        ) {
            approvals.push({
                leaveRequestId: leaveRequest.id,
                approverId: hrAdminId,
                approvalOrder: 2,
            });
        }

        // Create all approvals
        if (approvals.length > 0) {
            await prisma.approval.createMany({
                data: approvals as any,
            });

            // Notify Step 1 approver (usually the Manager)
            const firstApproval = approvals.find(a => a.approvalOrder === 1);
            if (firstApproval) {
                await prisma.notification.create({
                    data: {
                        userId: firstApproval.approverId,
                        companyId: session.user.companyId,
                        title: tLeaves('newRequestNotificationTitle') || 'Yeni İzin Talebi',
                        message: tLeaves('newRequestNotificationMessage', { name: session.user.name || '' }) || `${session.user.name || ''} yeni bir izin talebi oluşturdu. Onayınız bekleniyor.`,
                        link: `/dashboard/leaves/${leaveRequest.id}`,
                    }
                });
            } else {
                // If there's no step 1 (straight to HR), notify the first one in list
                const firstOne = approvals[0];
                await prisma.notification.create({
                    data: {
                        userId: firstOne.approverId,
                        companyId: session.user.companyId,
                        title: tLeaves('newRequestNotificationTitle') || 'Yeni İzin Talebi',
                        message: tLeaves('newRequestNotificationMessage', { name: session.user.name || '' }) || `${session.user.name || ''} yeni bir izin talebi oluşturdu. Onayınız bekleniyor.`,
                        link: `/dashboard/leaves/${leaveRequest.id}`,
                    }
                });
            }
        }

        return NextResponse.json(leaveRequest, { status: 201 });
    } catch (error: any) {
        console.error('Error creating leave request:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create leave request' },
            { status: 500 }
        );
    }
}
