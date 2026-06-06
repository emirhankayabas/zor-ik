import { describe, it, expect } from "vitest";
import {
  calculateAttendanceMetrics,
  timeToMinutes,
  parseTime,
} from "@/lib/attendance-calc";

const shift = { startTime: "09:00", endTime: "18:00", breakMinutes: 60 };
// 2024-01-01 sabit gün; saat bileşeni metrikleri belirler
const at = (h: number, m: number) => new Date(2024, 0, 1, h, m);

describe("parseTime / timeToMinutes", () => {
  it("HH:mm'i doğru ayrıştırır", () => {
    expect(parseTime("09:30")).toEqual({ hours: 9, minutes: 30 });
    expect(timeToMinutes("09:30")).toBe(570);
    expect(timeToMinutes("00:00")).toBe(0);
  });
});

describe("calculateAttendanceMetrics", () => {
  it("geç giriş dakikasını hesaplar", () => {
    const m = calculateAttendanceMetrics(shift, at(9, 15), null);
    expect(m.lateMinutes).toBe(15);
  });

  it("zamanında/erken giriş geç dakika üretmez", () => {
    expect(calculateAttendanceMetrics(shift, at(9, 0), null).lateMinutes).toBe(0);
    expect(calculateAttendanceMetrics(shift, at(8, 50), null).lateMinutes).toBe(0);
  });

  it("erken çıkış dakikasını hesaplar", () => {
    const m = calculateAttendanceMetrics(shift, at(9, 0), at(17, 30));
    expect(m.earlyMinutes).toBe(30);
    expect(m.overtimeMinutes).toBe(0);
  });

  it("fazla mesai dakikasını hesaplar", () => {
    const m = calculateAttendanceMetrics(shift, at(9, 0), at(18, 45));
    expect(m.overtimeMinutes).toBe(45);
    expect(m.earlyMinutes).toBe(0);
  });

  it("toplam çalışma = çıkış - giriş - mola", () => {
    // 09:00 → 18:00 = 540 dk, 60 dk mola → 480
    const m = calculateAttendanceMetrics(shift, at(9, 0), at(18, 0));
    expect(m.totalWorkMinutes).toBe(480);
  });

  it("çıkış yoksa (sadece giriş) yalnız geç dakika dolar", () => {
    const m = calculateAttendanceMetrics(shift, at(9, 20), null);
    expect(m.lateMinutes).toBe(20);
    expect(m.earlyMinutes).toBe(0);
    expect(m.overtimeMinutes).toBe(0);
    expect(m.totalWorkMinutes).toBe(0);
  });

  it("negatif toplam çalışmayı 0'a sabitler", () => {
    const m = calculateAttendanceMetrics(shift, at(18, 0), at(18, 10));
    expect(m.totalWorkMinutes).toBe(0);
  });
});
