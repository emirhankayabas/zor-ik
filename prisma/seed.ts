import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

    // Seed Leave Types
    const leaveTypes = [
        {
            name: 'Yıllık İzin',
            description: 'Yıllık ücretli izin',
        },
        {
            name: 'Saatlik İzin',
            description: 'Günlük saatlik izin',
        },
        {
            name: 'Mazeret İzni',
            description: 'Mazeret izni',
        },
        {
            name: 'Hastalık İzni',
            description: 'Sağlık raporu ile hastalık izni',
        },
        {
            name: 'Evlilik İzni',
            description: 'Evlilik nedeniyle izin',
        },
        {
            name: 'Doğum İzni',
            description: 'Doğum nedeniyle izin',
        },
        {
            name: 'Ölüm İzni',
            description: 'Yakın kaybı nedeniyle izin',
        },
    ];

    // Seed Leave Types
    for (const type of leaveTypes) {
        await prisma.leaveType.upsert({
            where: { name: type.name },
            update: { description: type.description },
            create: type,
        })
    }

    // Seed Departments
    const departments = [
        { name: 'İnsan Kaynakları' },
    ]

    const companies = await prisma.company.findMany()
    for (const company of companies) {
        // Find an admin to be the manager
        const adminUser = await prisma.user.findFirst({
            where: {
                role: 'COMPANY_ADMIN',
                companyId: company.id
            }
        });

        // Explicit check and then update/create
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

    // Cleanup: Delete old shorthand if it still exists (one-time cleanup)
    await prisma.department.deleteMany({
        where: { name: 'İK' }
    });

    console.log('✅ Base data seeded successfully')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
