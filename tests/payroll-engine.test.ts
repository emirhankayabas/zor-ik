import { describe, it, expect } from "vitest";
import {
  calculateNetFromGross,
  calculateGrossFromNet,
} from "@/lib/payroll-engine";

// 2026 sabitleri
const ASGARI_UCRET_BRUT = 33030;
const SGK_TAVAN = ASGARI_UCRET_BRUT * 7.5; // 247725

describe("calculateNetFromGross", () => {
  it("asgari ücrette net = 28075.50 (gelir+damga vergisi istisnası tam karşılar)", () => {
    const r = calculateNetFromGross(ASGARI_UCRET_BRUT);
    expect(r.netSalary).toBe(28075.5);
    expect(r.incomeTax).toBe(0);
    expect(r.stampTax).toBe(0);
  });

  it("SGK primi tavandan kesilir (7.5× asgari ücret üstü kazançta sabitlenir)", () => {
    const r = calculateNetFromGross(300000);
    // 300000 > tavan → prim tavan üzerinden
    expect(r.sgkEmployee).toBeCloseTo(SGK_TAVAN * 0.14, 2);
    expect(r.unemploymentEmployee).toBeCloseTo(SGK_TAVAN * 0.01, 2);
    expect(r.sgkEmployer).toBeCloseTo(SGK_TAVAN * 0.155, 2);
  });

  it("tavan altı kazançta SGK primi brüt üzerinden hesaplanır", () => {
    const r = calculateNetFromGross(100000);
    expect(r.sgkEmployee).toBeCloseTo(100000 * 0.14, 2);
    expect(r.unemploymentEmployee).toBeCloseTo(100000 * 0.01, 2);
  });

  it("ilk dilimde (%15) vergi pozitif ve net brütten küçük", () => {
    const r = calculateNetFromGross(100000);
    expect(r.taxRate).toBe(0.15);
    expect(r.incomeTax).toBeGreaterThan(0);
    expect(r.netSalary).toBeLessThan(100000);
  });

  it("gelir vergisi matrahı = brüt - SGK/işsizlik primi", () => {
    const r = calculateNetFromGross(100000);
    const totalPrim = 100000 * 0.15;
    expect(r.incomeTaxMatrah).toBeCloseTo(100000 - totalPrim, 2);
  });

  it("kümülatif matrah arttıkça üst dilime geçer (oran yükselir)", () => {
    const dusuk = calculateNetFromGross(100000, 0);
    const yuksek = calculateNetFromGross(100000, 700000); // 600k-1.5M dilimi → %27
    expect(yuksek.taxRate).toBeGreaterThan(dusuk.taxRate);
  });

  it("damga vergisi asgari ücret istisnası kadar düşülür", () => {
    const r = calculateNetFromGross(100000);
    const beklenen = (100000 - ASGARI_UCRET_BRUT) * 0.00759;
    expect(r.stampTax).toBeCloseTo(beklenen, 2);
  });
});

describe("calculateGrossFromNet", () => {
  it("net→brüt→net tur dönüşü tutarlı (±1 TL)", () => {
    const hedefNet = 50000;
    const brut = calculateGrossFromNet(hedefNet);
    const tekrarNet = calculateNetFromGross(brut).netSalary;
    expect(Math.abs(tekrarNet - hedefNet)).toBeLessThan(1);
  });

  it("0 veya negatif net için 0 döner", () => {
    expect(calculateGrossFromNet(0)).toBe(0);
    expect(calculateGrossFromNet(-5000)).toBe(0);
  });

  it("brüt her zaman net'ten büyük (kesintiler nedeniyle)", () => {
    const brut = calculateGrossFromNet(60000);
    expect(brut).toBeGreaterThan(60000);
  });
});
