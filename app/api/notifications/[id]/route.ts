import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/api-response';

// PATCH /api/notifications/[id] - Mark notification as read
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerAuthSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const notification = await prisma.notification.update({
            where: {
                id,
                userId: session.user.id,
            },
            data: {
                isRead: true,
            },
        });

        return NextResponse.json(notification);
    } catch (error) {
        return handleApiError(error);
    }
}
