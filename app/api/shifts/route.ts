import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getShiftSchema } from "@/lib/validations/employee";
import { canManageCompany } from "@/lib/access";
import { handleApiError } from "@/lib/api-response";
import { getTranslations } from "next-intl/server";
import type { Session } from "next-auth";

function canManageShifts(session: Session | null) {
  return canManageCompany(session?.user);
}


// GET /api/shifts - List all shifts for company
export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shifts = await prisma.shift.findMany({
      where: { companyId: session.user.companyId },
      include: {
        _count: { select: { employees: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(shifts);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/shifts - Create a new shift
export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session || !canManageShifts(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tValidation = await getTranslations("validation");
    const body = await request.json();
    const data = getShiftSchema(tValidation).parse(body);

    // If this shift is default, unset previous default
    if (data.isDefault) {
      await prisma.shift.updateMany({
        where: { companyId: session.user.companyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const shift = await prisma.shift.create({
      data: {
        ...data,
        companyId: session.user.companyId,
      },
    });

    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const tShifts = await getTranslations("shifts");
      return NextResponse.json(
        { error: tShifts("alreadyExists") || "Bu isimde bir vardiya zaten mevcut" },
        { status: 409 },
      );
    }
    return handleApiError(error);
  }
}
