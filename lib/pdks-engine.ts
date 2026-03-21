import prisma from "@/lib/prisma";

/**
 * Parse "HH:mm" string into { hours, minutes }
 */
function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return { hours, minutes };
}

/**
 * Convert a Date to minutes since midnight
 */
function dateToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Convert "HH:mm" to minutes since midnight
 */
function timeToMinutes(timeStr: string): number {
  const { hours, minutes } = parseTime(timeStr);
  return hours * 60 + minutes;
}

/**
 * Calculate attendance metrics based on shift and actual times.
 */
export function calculateAttendanceMetrics(
  shift: { startTime: string; endTime: string; breakMinutes: number },
  checkInTime: Date,
  checkOutTime: Date | null,
) {
  const shiftStart = timeToMinutes(shift.startTime);
  const shiftEnd = timeToMinutes(shift.endTime);
  const shiftDuration = shiftEnd - shiftStart - shift.breakMinutes;

  const actualIn = dateToMinutes(checkInTime);

  let lateMinutes = 0;
  let earlyMinutes = 0;
  let overtimeMinutes = 0;
  let totalWorkMinutes = 0;

  // Late entry: arrived after shift start
  if (actualIn > shiftStart) {
    lateMinutes = actualIn - shiftStart;
  }

  if (checkOutTime) {
    const actualOut = dateToMinutes(checkOutTime);

    // Early exit: left before shift end
    if (actualOut < shiftEnd) {
      earlyMinutes = shiftEnd - actualOut;
    }

    // Overtime: stayed after shift end
    if (actualOut > shiftEnd) {
      overtimeMinutes = actualOut - shiftEnd;
    }

    // Total work = checkout - checkin - break
    totalWorkMinutes = Math.max(0, actualOut - actualIn - shift.breakMinutes);
  }

  return { lateMinutes, earlyMinutes, overtimeMinutes, totalWorkMinutes };
}

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
