import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/api-response';

// GET /api/notifications - Get unread notifications for the current user
export async function GET() {
    try {
        const session = await getServerAuthSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
                isRead: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });

        return NextResponse.json(notifications);
    } catch (error) {
        return handleApiError(error);
    }
}
