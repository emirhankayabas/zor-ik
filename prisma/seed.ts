import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

    // Seed Leave Types
    const leaveTypes = [
        { name: 'Yıllık İzin', description: 'Yıllık ücretli izin' },
        { name: 'Saatlik İzin', description: 'Günlük saatlik izin' },
        { name: 'Mazeret İzni', description: 'Mazeret izni' },
        { name: 'Hastalık İzni', description: 'Sağlık raporu ile hastalık izni' },
        { name: 'Evlilik İzni', description: 'Evlilik nedeniyle izin' },
        { name: 'Doğum İzni', description: 'Doğum nedeniyle izin' },
        { name: 'Ölüm İzni', description: 'Yakın kaybı nedeniyle izin' },
    ];

    for (const type of leaveTypes) {
        await prisma.leaveType.upsert({
            where: { name: type.name },
            update: { description: type.description },
            create: type,
        })
    }

    // For each company: ensure İK department + default shifts + default RBAC permissions
    const companies = await prisma.company.findMany()
    for (const company of companies) {
        // Find an admin to be the İK manager
        const adminUser = await prisma.user.findFirst({
            where: {
                role: 'COMPANY_ADMIN',
                companyId: company.id
            }
        });

        // ── İnsan Kaynakları Department ──
        const existingDept = await prisma.department.findFirst({
            where: { name: 'İnsan Kaynakları', companyId: company.id }
        });

        if (existingDept) {
            await prisma.department.update({
                where: { id: existingDept.id },
                data: { managerId: adminUser?.id || null }
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

        // ── Default Shifts ──
        const defaultShifts = [
            { name: 'Gündüz', startTime: '08:30', endTime: '17:30', breakMinutes: 60, isDefault: true },
            { name: 'Gece', startTime: '22:00', endTime: '06:00', breakMinutes: 30, isDefault: false },
        ];

        for (const shift of defaultShifts) {
            const exists = await prisma.shift.findFirst({
                where: { name: shift.name, companyId: company.id }
            });

            if (!exists) {
                await prisma.shift.create({
                    data: { ...shift, companyId: company.id }
                });
            }
        }

        // ── Default RBAC Permissions ──
        const defaultPermissions = [
            // COMPANY_ADMIN gets full access
            ...['employees', 'departments', 'salary', 'payroll', 'reports', 'pdks', 'settings', 'leave_approvals', 'attendance_approvals'].map(r => ({
                role: 'COMPANY_ADMIN' as const, resource: r, canView: true, canEdit: true,
            })),
            // MANAGER gets limited access
            ...['employees', 'departments', 'pdks', 'leave_approvals', 'attendance_approvals'].map(r => ({
                role: 'MANAGER' as const, resource: r, canView: true, canEdit: r === 'leave_approvals' || r === 'attendance_approvals',
            })),
            { role: 'MANAGER' as const, resource: 'reports', canView: true, canEdit: false },
            // EMPLOYEE gets minimal access
            { role: 'EMPLOYEE' as const, resource: 'pdks', canView: true, canEdit: false },
        ];

        for (const perm of defaultPermissions) {
            const exists = await prisma.rolePermission.findFirst({
                where: { role: perm.role, resource: perm.resource, companyId: company.id }
            });

            if (!exists) {
                await prisma.rolePermission.create({
                    data: { ...perm, companyId: company.id }
                });
            }
        }
    }

    // Cleanup: Delete old shorthand if it still exists
    await prisma.department.deleteMany({
        where: { name: 'İK' }
    });

    console.log('✅ Base data seeded successfully (Leave Types, İK Dept, Shifts, RBAC)')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
