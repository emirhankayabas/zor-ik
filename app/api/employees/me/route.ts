import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/api-response";

export async function GET() {
    try {
        const session = await getServerAuthSession();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const employee = await prisma.employee.findUnique({
            where: { userId: session.user.id },
            include: {
                department: true,
            },
        });

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }

        return NextResponse.json(employee);
    } catch (error) {
        return handleApiError(error);
    }
}
