import { differenceInDays, differenceInYears, eachDayOfInterval, format, isSameDay } from "date-fns";

export interface Holiday {
    date: Date;
    name: string;
    isHalfDay: boolean;
}

/**
 * Calculates the number of days between two dates, 
 * excluding non-working days and public holidays.
 */
export function calculateLeaveDays(
    startDate: Date,
    endDate: Date,
    workingDays: number[], // 0 for Sunday, 1 for Monday, etc.
    holidays: Holiday[]
): number {
    if (startDate > endDate) return 0;

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    let count = 0;

    for (const day of days) {
        const dayOfWeek = day.getDay();

        // Skip if it's not a working day
        if (!workingDays.includes(dayOfWeek)) {
            continue;
        }

        // Check for holidays
        const holiday = holidays.find((h) => isSameDay(new Date(h.date), day));

        if (holiday) {
            if (holiday.isHalfDay) {
                count += 0.5;
            } else {
                // Full holiday - skip
                continue;
            }
        } else {
            // Normal working day
            count += 1;
        }
    }

    return count;
}

/**
 * Calculates annual leave quota based on seniority (Turkish Labor Law standards).
 * 1-5 years: 14 days
 * 5-15 years: 20 days
 * 15+ years: 26 days
 */
export function calculateSeniorityQuota(hireDate: Date): number {
    const yearsOfService = differenceInYears(new Date(), new Date(hireDate));

    if (yearsOfService < 1) return 0;
    if (yearsOfService < 5) return 14;
    if (yearsOfService < 15) return 20;
    return 26;
}

/**
 * Formats a date for comparison or display
 */
export function formatDate(date: Date): string {
    return format(date, "yyyy-MM-dd");
}
