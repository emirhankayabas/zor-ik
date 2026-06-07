/**
 * Pure, dependency-free validators for Turkish HR data.
 * No DB / i18n — unit-testable in isolation.
 */

/**
 * Validates a Turkish national identity number (TC Kimlik No).
 *
 * Rules:
 * - Exactly 11 digits
 * - First digit cannot be 0
 * - 10th digit = ((sum of odd-indexed digits) * 7 - (sum of even-indexed digits)) mod 10
 * - 11th digit = (sum of first 10 digits) mod 10
 */
export function isValidTCKN(value: string): boolean {
  if (!/^\d{11}$/.test(value)) return false;
  const d = value.split("").map(Number);
  if (d[0] === 0) return false;

  const oddSum = d[0] + d[2] + d[4] + d[6] + d[8]; // 1st,3rd,5th,7th,9th
  const evenSum = d[1] + d[3] + d[5] + d[7]; // 2nd,4th,6th,8th

  const tenth = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
  if (tenth !== d[9]) return false;

  const firstTenSum = d.slice(0, 10).reduce((a, b) => a + b, 0);
  const eleventh = firstTenSum % 10;
  return eleventh === d[10];
}

/**
 * Validates a Turkish IBAN (TR + 24 digits = 26 chars) using the ISO 13616 mod-97 checksum.
 * Spaces are ignored. Case-insensitive.
 */
export function isValidIBAN(value: string): boolean {
  const iban = value.replace(/\s+/g, "").toUpperCase();
  if (!/^TR\d{24}$/.test(iban)) return false;

  // Move the first 4 chars to the end, then replace letters with numbers (A=10 … Z=35).
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));

  // mod-97 over a long numeric string, processed in chunks to avoid BigInt overhead.
  let remainder = 0;
  for (let i = 0; i < numeric.length; i++) {
    remainder = (remainder * 10 + (numeric.charCodeAt(i) - 48)) % 97;
  }
  return remainder === 1;
}

/** Normalizes an IBAN to canonical uppercase, no-spaces form. */
export function normalizeIBAN(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}
