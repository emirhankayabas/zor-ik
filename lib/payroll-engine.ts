/**
 * Payroll Calculation Engine - Turkish Tax Standards (2025)
 * 
 * Logic follows the standard Gross-to-Net formula used in Turkey.
 */

export interface PayrollResult {
    grossSalary: number;
    sgkEmployee: number;
    unemploymentEmployee: number;
    sgkEmployer: number;
    unemploymentEmployer: number;
    totalEmployerCost: number;
    incomeTaxMatrah: number;
    taxRate: number; // For "Dilim" column
    incomeTax: number; // Final after exemption
    stampTax: number; // Final after exemption
    taxExemption: number;
    agi: number; // Post-2022 it's 0 but kept for UI structure
    netSalary: number;
    totalSalary: number; // Net + AGİ
}

// 2026 Constants (User provided)
const ASGARI_UCRET_BRUT = 33030.00;
const ASGARI_UCRET_NET = 28075.50;
const ASGARI_UCRET_MATRAH_ISTISNA = 28075.50; // Brüt - %15 Prim

const INCOME_TAX_BRACKETS = [
    { threshold: 250000, rate: 0.15 },
    { threshold: 600000, rate: 0.20 },
    { threshold: 1500000, rate: 0.27 },
    { threshold: 7000000, rate: 0.35 },
    { threshold: Infinity, rate: 0.40 },
];

/**
 * Calculates net salary from gross salary.
 * 
 * @param gross - The gross salary amount
 * @param cumulativeMatrah - Cumulative income tax base from previous months in the same year
 */
export function calculateNetFromGross(
    gross: number,
    cumulativeMatrah: number = 0
): PayrollResult {
    // 1. SGK Payı (%14) & İşsizlik Payı (%1)
    const sgkEmployee = gross * 0.14;
    const unemploymentEmployee = gross * 0.01;
    const totalPrim = sgkEmployee + unemploymentEmployee;

    // 1.1 SGK İşveren Payı (%15.5 - with 5% incentive) & İşsizlik İşveren Payı (%2)
    const sgkEmployer = gross * 0.155;
    const unemploymentEmployer = gross * 0.02;

    // 2. Gelir Vergisi Matrahı
    let incomeTaxMatrah = gross - totalPrim;

    // 3. Asgari Ücret GV İstisnası (Matrah üzerinden düşüm - user formula)
    const asgariUcretMatrahIstisnası = ASGARI_UCRET_MATRAH_ISTISNA;
    let taxableMatrah = Math.max(0, incomeTaxMatrah - asgariUcretMatrahIstisnası);

    // 4. Gelir Vergisi Hesaplama (Dilimli Oranlar)
    let remainingMatrah = taxableMatrah;
    let currentMatrahTotal = cumulativeMatrah;
    let incomeTax = 0;
    let activeTaxRate = 0;

    for (let i = 0; i < INCOME_TAX_BRACKETS.length; i++) {
        const bracket = INCOME_TAX_BRACKETS[i];
        const prevThreshold = i === 0 ? 0 : INCOME_TAX_BRACKETS[i - 1].threshold;

        if (currentMatrahTotal < bracket.threshold) {
            const availableInBracket = bracket.threshold - Math.max(currentMatrahTotal, prevThreshold);
            const amountInBracket = Math.min(remainingMatrah, availableInBracket);

            if (amountInBracket > 0) {
                incomeTax += amountInBracket * bracket.rate;
                remainingMatrah -= amountInBracket;
                currentMatrahTotal += amountInBracket;
                activeTaxRate = bracket.rate; // Capture the last active rate
            }
        }
        if (remainingMatrah <= 0) break;
    }

    if (activeTaxRate === 0 && INCOME_TAX_BRACKETS.length > 0) {
        activeTaxRate = INCOME_TAX_BRACKETS[0].rate;
    }

    // 5. Damga Vergisi (%0.759) ve İstisnası
    const rawStampTax = gross * 0.00759;
    const asgariUcretStampTax = ASGARI_UCRET_BRUT * 0.00759;
    const stampTax = Math.max(0, rawStampTax - asgariUcretStampTax);

    // 6. Net Maaş
    const netSalary = gross - totalPrim - incomeTax - stampTax;

    // 7. İşveren Maliyeti
    const totalEmployerCost = gross + sgkEmployer + unemploymentEmployer;

    return {
        grossSalary: gross,
        sgkEmployee,
        unemploymentEmployee,
        sgkEmployer,
        unemploymentEmployer,
        totalEmployerCost,
        incomeTaxMatrah,
        taxRate: activeTaxRate,
        incomeTax,
        stampTax,
        taxExemption: asgariUcretMatrahIstisnası,
        agi: 0, // Asgari Geçim İndirimi is 0 since 2022
        netSalary: Math.round(netSalary * 100) / 100,
        totalSalary: Math.round(netSalary * 100) / 100, // In modern system, net equals total
    };
}

/**
 * Calculates gross salary from desired net salary.
 * Uses an iterative approach (Binary Search) due to non-linear tax brackets.
 */
export function calculateGrossFromNet(
    targetNet: number,
    cumulativeMatrah: number = 0
): number {
    if (targetNet <= 0) return 0;

    let low = targetNet;
    let high = targetNet * 3; // Reasonable ceiling for high-tax scenarios
    let gross = targetNet;
    const precision = 0.01;
    let iterations = 0;

    while (iterations < 50) {
        gross = (low + high) / 2;
        const result = calculateNetFromGross(gross, cumulativeMatrah);

        if (Math.abs(result.netSalary - targetNet) < precision) {
            break;
        }

        if (result.netSalary < targetNet) {
            low = gross;
        } else {
            high = gross;
        }
        iterations++;
    }

    return Math.round(gross * 100) / 100;
}
