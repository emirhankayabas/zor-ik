import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const ALLOWED_ROLES = ["SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER"];
const ALLOWED_DEPTS = ["İK", "İnsan Kaynakları"];

function canManageShifts(session: any) {
  if (!session) return false;
  if (ALLOWED_ROLES.includes(session.user.role)) return true;
  if (ALLOWED_DEPTS.includes(session.user.departmentName)) return true;
  return false;
}

const updateShiftSchema = z.object({
  name: z.string().min(1, "Vardiya adı zorunludur"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Geçerli saat formatı: HH:mm"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Geçerli saat formatı: HH:mm"),
  breakMinutes: z.number().min(0),
  isDefault: z.boolean(),
});

// PUT /api/shifts/[id] - Update a shift
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerAuthSession();
    if (!session || !canManageShifts(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateShiftSchema.parse(body);

    // Verify shift belongs to company
    const existing = await prisma.shift.findFirst({
      where: { id, companyId: session.user.companyId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Vardiya bulunamadı" }, { status: 404 });
    }

    // If this shift is being set as default, unset previous default
    if (data.isDefault && !existing.isDefault) {
      await prisma.shift.updateMany({
        where: { companyId: session.user.companyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const shift = await prisma.shift.update({
      where: { id },
      data,
    });

    return NextResponse.json(shift);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu isimde bir vardiya zaten mevcut" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/shifts/[id] - Delete a shift
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerAuthSession();
    if (!session || !canManageShifts(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.shift.findFirst({
      where: { id, companyId: session.user.companyId },
      include: { _count: { select: { employees: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Vardiya bulunamadı" }, { status: 404 });
    }

    if (existing._count.employees > 0) {
      return NextResponse.json(
        { error: `Bu vardiyaya ${existing._count.employees} çalışan atanmış. Önce çalışanları başka vardiyaya taşıyın.` },
        { status: 400 },
      );
    }

    await prisma.shift.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
