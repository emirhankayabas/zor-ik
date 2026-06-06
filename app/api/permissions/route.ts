import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/api-response";
import { z } from "zod";

const permissionSchema = z.object({
  role: z.enum(["COMPANY_ADMIN", "MANAGER", "EMPLOYEE"]),
  resource: z.string().min(1),
  canView: z.boolean(),
  canEdit: z.boolean(),
});

// Default resources for RBAC
export const RBAC_RESOURCES = [
  { key: "employees", label: "Çalışanlar" },
  { key: "departments", label: "Departmanlar" },
  { key: "salary", label: "Maaş Bilgileri" },
  { key: "payroll", label: "Bordro" },
  { key: "reports", label: "Raporlar" },
  { key: "pdks", label: "PDKS Kayıtları" },
  { key: "settings", label: "Ayarlar" },
  { key: "leave_approvals", label: "İzin Onayları" },
  { key: "attendance_approvals", label: "Düzeltme Onayları" },
] as const;

// GET /api/permissions - List all permissions for company
export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session || !["COMPANY_ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const permissions = await prisma.rolePermission.findMany({
      where: { companyId: session.user.companyId },
      orderBy: [{ role: "asc" }, { resource: "asc" }],
    });

    return NextResponse.json(permissions);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/permissions - Create or update a permission
export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session || !["COMPANY_ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = permissionSchema.parse(body);

    const permission = await prisma.rolePermission.upsert({
      where: {
        role_resource_companyId: {
          role: data.role,
          resource: data.resource,
          companyId: session.user.companyId,
        },
      },
      update: {
        canView: data.canView,
        canEdit: data.canEdit,
      },
      create: {
        role: data.role,
        resource: data.resource,
        canView: data.canView,
        canEdit: data.canEdit,
        companyId: session.user.companyId,
      },
    });

    return NextResponse.json(permission);
  } catch (error) {
    return handleApiError(error);
  }
}
