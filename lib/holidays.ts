import prisma from "./prisma";

export async function syncPublicHolidays(companyId: string, year: number) {
    try {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/TR`);
        if (!response.ok) throw new Error("Failed to fetch holidays");

        const holidays = await response.json();

        for (const holiday of holidays) {
            // Basic holiday data
            const date = new Date(holiday.date);

            // Upsert into our DB
            await prisma.holiday.upsert({
                where: {
                    date_companyId: {
                        date: date,
                        companyId: companyId,
                    },
                },
                update: {
                    name: holiday.localName || holiday.name,
                },
                create: {
                    date: date,
                    name: holiday.localName || holiday.name,
                    companyId: companyId,
                    isHalfDay: false,
                },
            });
        }

        return { success: true, count: holidays.length };
    } catch (error) {
        console.error("Holiday sync error:", error);
        return { success: false, error: (error as Error).message };
    }
}
