import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const leaveTypes = [
            { name: 'Yıllık İzin', description: 'Yıllık ücretli izin' },
            { name: 'Saatlik İzin', description: 'Günlük saatlik izin' },
            { name: 'Mazeret İzni', description: 'Mazeret izni' },
            { name: 'Hastalık İzni', description: 'Sağlık raporu ile hastalık izni' },
            { name: 'Evlilik İzni', description: 'Evlilik nedeniyle izin' },
            { name: 'Doğum İzni', description: 'Doğum nedeniyle izin' },
            { name: 'Ölüm İzni', description: 'Yakın kaybı nedeniyle izin' },
        ];

        for (const leaveType of leaveTypes) {
            await prisma.leaveType.upsert({
                where: { name: leaveType.name },
                update: {},
                create: leaveType,
            });
        }

        const companies = await prisma.company.findMany();
        for (const company of companies) {
            const adminUser = await prisma.user.findFirst({
                where: {
                    role: 'COMPANY_ADMIN',
                    companyId: company.id
                }
            });

            const existing = await prisma.department.findFirst({
                where: {
                    name: 'İnsan Kaynakları',
                    companyId: company.id
                }
            });

            if (existing) {
                await prisma.department.update({
                    where: { id: existing.id },
                    data: {
                        managerId: adminUser?.id || null
                    }
                });
            } else {
                await prisma.department.create({
                    data: {
                        name: 'İnsan Kaynakları',
                        companyId: company.id,
                        managerId: adminUser?.id || null,
                    }
                });
            }
        }


        // Cleanup shorthand
        await prisma.department.deleteMany({
            where: { name: 'İK' }
        });

        return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
