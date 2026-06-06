import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { isHrDepartmentName, HR_DEPARTMENT_NAMES } from '@/lib/access';
import { Prisma } from '@prisma/client';
import { handleApiError } from '@/lib/api-response';
import { getAttendanceCorrectionSchema } from '@/lib/validations/employee';
import { getTranslations } from 'next-intl/server';

// GET /api/attendance-corrections - Get attendance correction requests (filtered by role)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerAuthSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const personalOnly = searchParams.get('personal') === 'true';

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

        const isHRMember = isHrDepartmentName(employee.department?.name);

        let requests;

        // Filter based on role and department
        if (!personalOnly && (session.user.role === 'COMPANY_ADMIN' || session.user.role === 'SUPER_ADMIN' || isHRMember)) {
            // HR sees all requests for their company (when not just personal)
            requests = await prisma.attendanceCorrection.findMany({
                where: {
                    employee: {
                        companyId: session.user.companyId,
                    },
                },
                include: {
                    employee: {
                        include: {
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
                    approvals: {
                        include: {
                            approver: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
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
            // Managers see their own requests + requests from their department (when not just personal)
            requests = await prisma.attendanceCorrection.findMany({
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
                        include: {
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
                    approvals: {
                        include: {
                            approver: {
                                select: {
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
            requests = await prisma.attendanceCorrection.findMany({
                where: {
                    employeeId: employee.id,
                },
                include: {
                    employee: {
                        include: {
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
                    approvals: {
                        include: {
                            approver: {
                                select: {
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

        return NextResponse.json(requests);
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/attendance-corrections - Create new attendance correction request
export async function POST(request: NextRequest) {
    try {
        const session = await getServerAuthSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tValidation = await getTranslations('validation');
        const tAttendance = await getTranslations('attendance');
        const body = await request.json();
        const validatedData = getAttendanceCorrectionSchema(tValidation).parse(body);

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

        // Create correction request
        const correctionRequest = await prisma.attendanceCorrection.create({
            data: {
                employeeId: employee.id,
                type: validatedData.type,
                date: new Date(validatedData.date),
                entryTime: validatedData.entryTime || null,
                exitTime: validatedData.exitTime || null,
                reason: validatedData.reason,
                status: 'PENDING',
                companyId: session.user.companyId,
            },
        });

        // Create approval workflow: Employee -> Manager -> HR
        const approvals: Prisma.ApprovalCreateManyInput[] = [];

        // Step 1: Manager approval (if employee has a manager)
        if (employee.department?.managerId && employee.department.managerId !== employee.userId) {
            approvals.push({
                attendanceCorrectionId: correctionRequest.id,
                approverId: employee.department.managerId,
                approvalOrder: 1,
            });
        }

        // Step 2: HR approval
        // Priority: İK dept manager → any İK dept member with MANAGER role → any COMPANY_ADMIN
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
            // İK dept exists but no manager — find any MANAGER-role user in İK
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
            // Fallback: any COMPANY_ADMIN in the company
            const firstAdmin = await prisma.user.findFirst({
                where: {
                    role: 'COMPANY_ADMIN',
                    companyId: session.user.companyId,
                },
            });
            hrAdminId = firstAdmin?.id || null;
        }

        // Last resort: if still no HR approver, use the company's first MANAGER who is not the dept manager already in step 1
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
            hrAdminId !== employee.userId &&
            !approvals.some(a => a.approverId === hrAdminId)
        ) {
            approvals.push({
                attendanceCorrectionId: correctionRequest.id,
                approverId: hrAdminId,
                approvalOrder: 2,
            });
        }

        // Create all approvals
        if (approvals.length > 0) {
            await prisma.approval.createMany({
                data: approvals,
            });

            // Notify Step 1 approver
            const firstApproval = approvals.sort((a, b) => a.approvalOrder - b.approvalOrder)[0];
            if (firstApproval) {
                await prisma.notification.create({
                    data: {
                        userId: firstApproval.approverId,
                        companyId: session.user.companyId,
                        title: tAttendance('newRequestNotificationTitle') || 'Yeni Giriş/Çıkış Düzeltme Talebi',
                        message: tAttendance('newRequestNotificationMessage', { name: session.user.name || '' }) || `${session.user.name} yeni bir düzeltme talebi oluşturdu. Onayınız bekleniyor.`,
                        link: `/dashboard/hr/attendance-requests`,
                    }
                });
            }
        }

        return NextResponse.json(correctionRequest, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
