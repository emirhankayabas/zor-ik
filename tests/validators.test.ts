import { describe, it, expect } from "vitest";
import { isValidTCKN, isValidIBAN, normalizeIBAN } from "@/lib/validators";

describe("isValidTCKN", () => {
  it("geçerli TC Kimlik No'yu kabul eder", () => {
    // Algoritmaya uygun üretilmiş geçerli örnekler
    expect(isValidTCKN("10000000146")).toBe(true);
    expect(isValidTCKN("19191919190")).toBe(true);
  });

  it("11 haneli olmayanı reddeder", () => {
    expect(isValidTCKN("1234567890")).toBe(false); // 10 hane
    expect(isValidTCKN("123456789012")).toBe(false); // 12 hane
    expect(isValidTCKN("")).toBe(false);
  });

  it("rakam olmayan içeriği reddeder", () => {
    expect(isValidTCKN("1000000014a")).toBe(false);
    expect(isValidTCKN("abcdefghijk")).toBe(false);
  });

  it("0 ile başlayanı reddeder", () => {
    expect(isValidTCKN("01234567890")).toBe(false);
  });

  it("checksum'u bozuk numarayı reddeder", () => {
    expect(isValidTCKN("10000000140")).toBe(false); // 11. hane yanlış
    expect(isValidTCKN("11111111111")).toBe(false);
  });
});

describe("isValidIBAN", () => {
  it("geçerli TR IBAN'ı kabul eder (boşluklu/boşluksuz)", () => {
    expect(isValidIBAN("TR330006100519786457841326")).toBe(true);
    expect(isValidIBAN("TR33 0006 1005 1978 6457 8413 26")).toBe(true);
    expect(isValidIBAN("tr330006100519786457841326")).toBe(true);
  });

  it("yanlış uzunluğu reddeder", () => {
    expect(isValidIBAN("TR33000610051978645784132")).toBe(false); // 25
    expect(isValidIBAN("TR3300061005197864578413260")).toBe(false); // 27
  });

  it("TR olmayan/biçimsiz IBAN'ı reddeder", () => {
    expect(isValidIBAN("DE89370400440532013000")).toBe(false);
    expect(isValidIBAN("TRXX0006100519786457841326")).toBe(false);
    expect(isValidIBAN("")).toBe(false);
  });

  it("checksum'u bozuk IBAN'ı reddeder", () => {
    expect(isValidIBAN("TR340006100519786457841326")).toBe(false);
  });
});

describe("normalizeIBAN", () => {
  it("boşlukları kaldırır ve büyük harfe çevirir", () => {
    expect(normalizeIBAN("tr33 0006 1005")).toBe("TR3300061005");
  });
});
