import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/api-response';

// GET /api/leave-types - Get all leave types
export async function GET() {
    try {
        const session = await getServerAuthSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const leaveTypes = await prisma.leaveType.findMany({
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(leaveTypes);
    } catch (error) {
        return handleApiError(error);
    }
}
