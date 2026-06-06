import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

/**
 * Tutarlı API hata yanıtları.
 *
 * Tüm route handler'ları `catch (error) { return handleApiError(error); }`
 * kullanır. Bu sayede:
 *  - `requireAuth()`/`getCompanyId()` fırlattığı "Unauthorized" → 401 (önceden 500'dü)
 *  - Zod doğrulama hataları → 400 + ilk alan mesajı + tüm alan detayları (önceden 500'dü)
 *  - Prisma bilinen hataları (benzersizlik, kayıt yok) → 409 / 404
 *  - Bilinçli iş kuralı hataları için `ApiError` fırlatılabilir
 *  - Beklenmeyen her şey → 500 + sunucuya loglanır, istemciye sızdırılmaz
 */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Kısa yardımcılar — route içinde `throw unauthorized()` gibi kullanılır. */
export const unauthorized = (message = "Oturum bulunamadı.") =>
  new ApiError(401, message);
export const forbidden = (message = "Bu işlem için yetkiniz yok.") =>
  new ApiError(403, message);
export const notFound = (message = "Kayıt bulunamadı.") =>
  new ApiError(404, message);
export const badRequest = (message = "Geçersiz istek.") =>
  new ApiError(400, message);
export const conflict = (message = "Bu kayıt zaten mevcut.") =>
  new ApiError(409, message);

/** Tek satır JSON hata yanıtı. */
export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown): NextResponse {
  // requireAuth() / getCompanyId() oturum yoksa Error('Unauthorized') fırlatır
  if (error instanceof Error && error.message === "Unauthorized") {
    return apiError("Oturum bulunamadı.", 401);
  }

  // Bilinçli fırlatılan iş kuralı / yetki hataları
  if (error instanceof ApiError) {
    return apiError(error.message, error.status);
  }

  // Zod gövde doğrulama hataları
  if (error instanceof ZodError) {
    const issues = error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    return NextResponse.json(
      { error: issues[0]?.message ?? "Geçersiz veri.", issues },
      { status: 400 },
    );
  }

  // Prisma bilinen istek hataları
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return apiError("Bu kayıt zaten mevcut.", 409);
    }
    if (error.code === "P2025") {
      return apiError("Kayıt bulunamadı.", 404);
    }
  }

  // Beklenmeyen — detayı istemciye sızdırma, sunucuya logla
  console.error("Beklenmeyen API hatası:", error);
  return apiError("Beklenmeyen bir hata oluştu.", 500);
}
