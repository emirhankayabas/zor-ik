import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function getServerAuthSession() {
    return await getServerSession(authOptions);
}

export async function requireAuth() {
    const session = await getServerAuthSession();
    if (!session) {
        throw new Error('Unauthorized');
    }
    return session;
}

export async function getCompanyId() {
    const session = await requireAuth();
    return session.user.companyId;
}
