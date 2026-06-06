import { describe, it, expect } from "vitest";
import { subYears, subMonths } from "date-fns";
import {
  calculateSeniorityQuota,
  calculateLeaveDays,
  type Holiday,
} from "@/lib/leave-engine";

describe("calculateSeniorityQuota (İş Kanunu m.53)", () => {
  it("1 yıldan az kıdemde izin hakkı yok (0)", () => {
    expect(calculateSeniorityQuota(subMonths(new Date(), 6))).toBe(0);
  });

  it("1-5 yıl arası 14 gün", () => {
    expect(calculateSeniorityQuota(subYears(new Date(), 1))).toBe(14);
    expect(calculateSeniorityQuota(subYears(new Date(), 3))).toBe(14);
  });

  it("5 yıl DAHİL 14 gün (sınır)", () => {
    expect(calculateSeniorityQuota(subYears(new Date(), 5))).toBe(14);
  });

  it("5 yıldan fazla, 15'ten az 20 gün", () => {
    expect(calculateSeniorityQuota(subYears(new Date(), 6))).toBe(20);
    expect(calculateSeniorityQuota(subYears(new Date(), 14))).toBe(20);
  });

  it("15 yıl DAHİL ve fazlası 26 gün", () => {
    expect(calculateSeniorityQuota(subYears(new Date(), 15))).toBe(26);
    expect(calculateSeniorityQuota(subYears(new Date(), 25))).toBe(26);
  });
});

describe("calculateLeaveDays", () => {
  const haftaIciCalisma = [1, 2, 3, 4, 5]; // Pzt-Cum

  it("Pzt-Cum aralığı 5 iş günü sayar", () => {
    // 2024-01-01 Pazartesi, 2024-01-05 Cuma
    const days = calculateLeaveDays(
      new Date(2024, 0, 1),
      new Date(2024, 0, 5),
      haftaIciCalisma,
      [],
    );
    expect(days).toBe(5);
  });

  it("hafta sonunu hariç tutar", () => {
    // 2024-01-01 Pzt → 2024-01-07 Pazar (Cmt+Pzr hariç) = 5
    const days = calculateLeaveDays(
      new Date(2024, 0, 1),
      new Date(2024, 0, 7),
      haftaIciCalisma,
      [],
    );
    expect(days).toBe(5);
  });

  it("tam gün resmi tatili düşer", () => {
    const holidays: Holiday[] = [
      { date: new Date(2024, 0, 3), name: "Test Tatili", isHalfDay: false },
    ];
    const days = calculateLeaveDays(
      new Date(2024, 0, 1),
      new Date(2024, 0, 5),
      haftaIciCalisma,
      holidays,
    );
    expect(days).toBe(4);
  });

  it("yarım gün tatili 0.5 sayar", () => {
    const holidays: Holiday[] = [
      { date: new Date(2024, 0, 3), name: "Yarım Gün", isHalfDay: true },
    ];
    const days = calculateLeaveDays(
      new Date(2024, 0, 1),
      new Date(2024, 0, 5),
      haftaIciCalisma,
      holidays,
    );
    expect(days).toBe(4.5);
  });

  it("başlangıç bitişten sonraysa 0 döner", () => {
    const days = calculateLeaveDays(
      new Date(2024, 0, 5),
      new Date(2024, 0, 1),
      haftaIciCalisma,
      [],
    );
    expect(days).toBe(0);
  });

  it("Cumartesi çalışan için 6 günlük çalışma haftasını sayar", () => {
    // Pzt-Cmt (1-6), Pazar hariç
    const days = calculateLeaveDays(
      new Date(2024, 0, 1),
      new Date(2024, 0, 7),
      [1, 2, 3, 4, 5, 6],
      [],
    );
    expect(days).toBe(6);
  });
});
