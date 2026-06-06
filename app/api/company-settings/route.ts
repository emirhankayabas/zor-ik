import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { handleApiError } from "@/lib/api-response";
import { z } from "zod";

const settingsSchema = z.object({
  name: z.string().min(1, "Şirket adı zorunludur").optional(),
  emailDomain: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  country: z.string().optional(),
});

// GET /api/company-settings
export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: {
        id: true,
        name: true,
        domain: true,
        emailDomain: true,
        timezone: true,
        locale: true,
        country: true,
        plan: true,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/company-settings - Admin only
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (
      !session ||
      (session.user.role !== "COMPANY_ADMIN" && session.user.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = settingsSchema.parse(body);

    const updateData: Prisma.CompanyUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.emailDomain !== undefined) updateData.emailDomain = data.emailDomain;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.locale !== undefined) updateData.locale = data.locale;
    if (data.country !== undefined) updateData.country = data.country;

    const company = await prisma.company.update({
      where: { id: session.user.companyId },
      data: updateData,
    });

    return NextResponse.json(company);
  } catch (error) {
    return handleApiError(error);
  }
}
