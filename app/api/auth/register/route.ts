import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getRegisterSchema } from '@/lib/validations/auth';
import { getTranslations } from 'next-intl/server';
import { UserRole } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const tValidation = await getTranslations('validation');
        const tAuth = await getTranslations('auth');
        const body = await request.json();

        // Validate input
        const validatedData = getRegisterSchema(tValidation).parse(body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email: validatedData.email,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: tAuth('emailInUse') || 'Bu e-posta adresi zaten kullanılıyor' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Create company and user in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create company
            const company = await tx.company.create({
                data: {
                    name: validatedData.companyName,
                    plan: 'free',
                },
            });

            // Create user (admin)
            const user = await tx.user.create({
                data: {
                    email: validatedData.email,
                    password: hashedPassword,
                    name: validatedData.name,
                    role: UserRole.COMPANY_ADMIN,
                    companyId: company.id,
                },
            });

            // Create employee record
            await tx.employee.create({
                data: {
                    userId: user.id,
                    companyId: company.id,
                    position: 'İK Müdürü',
                },
            });

            return { company, user };
        });

        return NextResponse.json(
            {
                message: tAuth('registerSuccess') || 'Kayıt başarılı',
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Registration error:', error);

        const tAuthCatch = await getTranslations('auth');
        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: tAuthCatch('invalidData') || 'Geçersiz form verileri' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: tAuthCatch('registerError') || 'Kayıt sırasında bir hata oluştu' },
            { status: 500 }
        );
    }
}
