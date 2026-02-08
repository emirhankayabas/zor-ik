import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
        console.error('Error fetching leave types:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leave types' },
            { status: 500 }
        );
    }
}
