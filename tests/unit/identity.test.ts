import { describe, expect, it } from "vitest";
import { IDENTITY_TTL_MS, encodeIdentity, parseIdentity } from "@/lib/domain/identity";

const NOW = 1_790_500_000_000;

describe("identity cookie", () => {
  it("round-trips a user id", () => {
    expect(parseIdentity(encodeIdentity("ana-torres", NOW), NOW)).toBe("ana-torres");
  });

  it("expires exactly 7 days after selection", () => {
    const value = encodeIdentity("ana-torres", NOW);
    expect(parseIdentity(value, NOW + IDENTITY_TTL_MS - 1)).toBe("ana-torres");
    expect(parseIdentity(value, NOW + IDENTITY_TTL_MS)).toBeNull();
  });

  it.each([undefined, "", "ana-torres", ".123", "ana-torres.abc", "ANA.123", `ana-torres.${NOW + 120_000}`])(
    "rejects %s",
    (value) => {
      expect(parseIdentity(value, NOW)).toBeNull();
    },
  );
});
