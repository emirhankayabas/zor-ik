import { NextRequest, NextResponse } from "next/server";
import { processCardSwipe } from "@/lib/pdks-engine";
import { handleApiError } from "@/lib/api-response";
import { z } from "zod";

const pdksLogSchema = z.object({
  card_id: z.string().min(1, "card_id is required"),
  timestamp: z.string().datetime().optional(),
});

/**
 * POST /api/pdks/log
 * External API endpoint for RFID/Card readers.
 * Accepts card_id and optional timestamp.
 *
 * Secured via API key in the Authorization header.
 */
export async function POST(request: NextRequest) {
  try {
    // API Key authentication for external devices
    const authHeader = request.headers.get("authorization");
    const apiKey = process.env.PDKS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "PDKS API key not configured on server" },
        { status: 500 },
      );
    }

    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = pdksLogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { card_id, timestamp } = parsed.data;
    const swipeTime = timestamp ? new Date(timestamp) : new Date();

    const result = await processCardSwipe(card_id, swipeTime);

    return NextResponse.json({
      success: true,
      action: result.action,
      log_id: result.log.id,
      employee_id: result.log.employeeId,
      check_in: result.log.checkIn,
      check_out: result.log.checkOut,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CARD_NOT_FOUND") {
      return NextResponse.json(
        { error: "Card not registered in system" },
        { status: 404 },
      );
    }
    if (error instanceof Error && error.message === "NO_SHIFT_ASSIGNED") {
      return NextResponse.json(
        { error: "Employee has no shift assigned" },
        { status: 422 },
      );
    }
    return handleApiError(error);
  }
}
