import prisma from "@/lib/prisma";
import { parseTime, calculateAttendanceMetrics } from "@/lib/attendance-calc";

export { calculateAttendanceMetrics };

/**
 * Process a card swipe from an external PDKS reader.
 * Logic: If no check-in today → create check-in. If check-in exists → update check-out.
 */
export async function processCardSwipe(cardId: string, timestamp: Date) {
  // Find employee by card ID
  const employee = await prisma.employee.findUnique({
    where: { cardId },
    include: {
      shift: true,
    },
  });

  if (!employee) {
    throw new Error("CARD_NOT_FOUND");
  }

  if (!employee.shift) {
    throw new Error("NO_SHIFT_ASSIGNED");
  }

  // Get the date part (strip time for the unique constraint)
  const dateOnly = new Date(
    timestamp.getFullYear(),
    timestamp.getMonth(),
    timestamp.getDate(),
  );

  // Check if there's an existing log for today
  const existingLog = await prisma.attendanceLog.findUnique({
    where: {
      employeeId_date: {
        employeeId: employee.id,
        date: dateOnly,
      },
    },
  });

  if (!existingLog) {
    // First swipe of the day → check-in
    const metrics = calculateAttendanceMetrics(
      employee.shift,
      timestamp,
      null,
    );

    const log = await prisma.attendanceLog.create({
      data: {
        employeeId: employee.id,
        companyId: employee.companyId,
        date: dateOnly,
        checkIn: timestamp,
        lateMinutes: metrics.lateMinutes,
        source: "CARD",
      },
    });

    return { action: "CHECK_IN", log };
  } else {
    // Subsequent swipe → check-out (update with latest time)
    const metrics = calculateAttendanceMetrics(
      employee.shift,
      existingLog.checkIn!,
      timestamp,
    );

    const log = await prisma.attendanceLog.update({
      where: { id: existingLog.id },
      data: {
        checkOut: timestamp,
        lateMinutes: metrics.lateMinutes,
        earlyMinutes: metrics.earlyMinutes,
        overtimeMinutes: metrics.overtimeMinutes,
        totalWorkMinutes: metrics.totalWorkMinutes,
      },
    });

    return { action: "CHECK_OUT", log };
  }
}

/**
 * Create or update an attendance log from an approved correction request.
 */
export async function applyCorrection(correctionId: string) {
  const correction = await prisma.attendanceCorrection.findUnique({
    where: { id: correctionId },
    include: {
      employee: {
        include: { shift: true },
      },
    },
  });

  if (!correction || correction.status !== "APPROVED") {
    throw new Error("INVALID_CORRECTION");
  }

  const dateOnly = new Date(
    correction.date.getFullYear(),
    correction.date.getMonth(),
    correction.date.getDate(),
  );

  // Build check-in/check-out from correction times
  let checkIn: Date | null = null;
  let checkOut: Date | null = null;

  if (correction.entryTime) {
    const { hours, minutes } = parseTime(correction.entryTime);
    checkIn = new Date(dateOnly);
    checkIn.setHours(hours, minutes, 0, 0);
  }

  if (correction.exitTime) {
    const { hours, minutes } = parseTime(correction.exitTime);
    checkOut = new Date(dateOnly);
    checkOut.setHours(hours, minutes, 0, 0);
  }

  // Calculate metrics if shift is assigned
  let metrics = { lateMinutes: 0, earlyMinutes: 0, overtimeMinutes: 0, totalWorkMinutes: 0 };
  if (correction.employee.shift && checkIn) {
    metrics = calculateAttendanceMetrics(
      correction.employee.shift,
      checkIn,
      checkOut,
    );
  }

  // Upsert the attendance log
  const log = await prisma.attendanceLog.upsert({
    where: {
      employeeId_date: {
        employeeId: correction.employeeId,
        date: dateOnly,
      },
    },
    update: {
      ...(checkIn && { checkIn }),
      ...(checkOut && { checkOut }),
      lateMinutes: metrics.lateMinutes,
      earlyMinutes: metrics.earlyMinutes,
      overtimeMinutes: metrics.overtimeMinutes,
      totalWorkMinutes: metrics.totalWorkMinutes,
      source: "CORRECTION",
    },
    create: {
      employeeId: correction.employeeId,
      companyId: correction.companyId,
      date: dateOnly,
      checkIn,
      checkOut,
      lateMinutes: metrics.lateMinutes,
      earlyMinutes: metrics.earlyMinutes,
      overtimeMinutes: metrics.overtimeMinutes,
      totalWorkMinutes: metrics.totalWorkMinutes,
      source: "CORRECTION",
    },
  });

  return log;
}
