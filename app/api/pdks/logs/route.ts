import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { canManageCompany } from "@/lib/access";
import { handleApiError } from "@/lib/api-response";
import type { Session } from "next-auth";

function canViewGlobalLogs(session: Session | null) {
  return canManageCompany(session?.user);
}

// GET /api/pdks/logs - Fetch attendance logs with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only Admin / HR can access global PDKS logs
    if (!canViewGlobalLogs(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const departmentId = searchParams.get("departmentId");

    const where: Prisma.AttendanceLogWhereInput = {
      companyId: session.user.companyId,
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (departmentId && departmentId !== "all") {
      where.employee = { departmentId };
    }

    const dateFilter: Prisma.DateTimeFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    if (startDate || endDate) where.date = dateFilter;

    const logs = await prisma.attendanceLog.findMany({
      where,
      include: {
        employee: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true } },
            shift: { select: { name: true, startTime: true, endTime: true } },
          },
        },
      },
      orderBy: { date: "desc" },
      take: 200,
    });

    return NextResponse.json(logs);
  } catch (error) {
    return handleApiError(error);
  }
}
