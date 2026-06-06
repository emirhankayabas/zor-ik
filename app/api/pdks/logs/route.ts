import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { canManageCompany } from "@/lib/access";
import { handleApiError } from "@/lib/api-response";

function canViewGlobalLogs(session: any) {
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

    const where: any = {
      companyId: session.user.companyId,
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (departmentId && departmentId !== "all") {
      where.employee = { departmentId };
    }

    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate) };
    }
    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) };
    }

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
