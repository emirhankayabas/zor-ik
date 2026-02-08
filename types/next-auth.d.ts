import { DefaultSession } from 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: UserRole;
            companyId: string;
            departmentName: string | null;
        } & DefaultSession['user'];
    }

    interface User {
        role: UserRole;
        companyId: string;
        departmentName: string | null;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: UserRole;
        companyId: string;
        departmentName: string | null;
    }
}
