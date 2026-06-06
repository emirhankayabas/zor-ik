/**
 * PDKS saf hesaplama yardımcıları (veritabanı bağımlılığı yok).
 * pdks-engine.ts bu fonksiyonları kullanır; ayrı dosyada olmaları DB olmadan
 * birim testi yazılmasını sağlar.
 */

/** "HH:mm" string'ini { hours, minutes } olarak ayrıştırır. */
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return { hours, minutes };
}

/** Bir Date'i gece yarısından itibaren dakikaya çevirir. */
export function dateToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** "HH:mm" değerini gece yarısından itibaren dakikaya çevirir. */
export function timeToMinutes(timeStr: string): number {
  const { hours, minutes } = parseTime(timeStr);
  return hours * 60 + minutes;
}

/**
 * Vardiya ve gerçek giriş/çıkış saatlerine göre devam metriklerini hesaplar.
 */
export function calculateAttendanceMetrics(
  shift: { startTime: string; endTime: string; breakMinutes: number },
  checkInTime: Date,
  checkOutTime: Date | null,
) {
  const shiftStart = timeToMinutes(shift.startTime);
  const shiftEnd = timeToMinutes(shift.endTime);

  const actualIn = dateToMinutes(checkInTime);

  let lateMinutes = 0;
  let earlyMinutes = 0;
  let overtimeMinutes = 0;
  let totalWorkMinutes = 0;

  // Geç giriş: vardiya başlangıcından sonra gelmiş
  if (actualIn > shiftStart) {
    lateMinutes = actualIn - shiftStart;
  }

  if (checkOutTime) {
    const actualOut = dateToMinutes(checkOutTime);

    // Erken çıkış: vardiya bitişinden önce ayrılmış
    if (actualOut < shiftEnd) {
      earlyMinutes = shiftEnd - actualOut;
    }

    // Fazla mesai: vardiya bitişinden sonra kalmış
    if (actualOut > shiftEnd) {
      overtimeMinutes = actualOut - shiftEnd;
    }

    // Toplam çalışma = çıkış - giriş - mola
    totalWorkMinutes = Math.max(0, actualOut - actualIn - shift.breakMinutes);
  }

  return { lateMinutes, earlyMinutes, overtimeMinutes, totalWorkMinutes };
}
