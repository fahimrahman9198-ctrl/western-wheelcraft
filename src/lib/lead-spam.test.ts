import { describe, it, expect } from "vitest";
import { isLikelySpam, type SpamCheckInput } from "./lead-spam";

function lead(overrides: Partial<SpamCheckInput> = {}): SpamCheckInput {
  return {
    customerName: "Daniel Blanchfield",
    customerEmail: "dblanchfield@gmail.com",
    damageDescription: "Curb rash on a 2016 Lexus RX350 rim.",
    ...overrides,
  };
}

describe("isLikelySpam", () => {
  it("passes a normal lead", () => {
    expect(isLikelySpam(lead())).toBeNull();
  });

  it("passes a normal lead with no message", () => {
    expect(isLikelySpam(lead({ damageDescription: undefined }))).toBeNull();
  });

  it("flags a filled honeypot", () => {
    expect(isLikelySpam(lead({ website: "http://spam.example" }))).toBe("honeypot");
  });

  it("ignores an empty/whitespace honeypot", () => {
    expect(isLikelySpam(lead({ website: "   " }))).toBeNull();
  });

  it("flags a message identical to the email (scripted filler)", () => {
    expect(
      isLikelySpam(lead({ customerEmail: "bot@x.com", damageDescription: "bot@x.com" }))
    ).toBe("message-equals-email");
  });

  it("is case- and whitespace-insensitive for message-equals-email", () => {
    expect(
      isLikelySpam(lead({ customerEmail: "Bot@X.com", damageDescription: "  bot@x.com " }))
    ).toBe("message-equals-email");
  });

  it("flags a name identical to the email", () => {
    expect(
      isLikelySpam(lead({ customerName: "bot@x.com", customerEmail: "bot@x.com", damageDescription: undefined }))
    ).toBe("name-equals-email");
  });

  it("does not flag a legitimate single-word name", () => {
    expect(
      isLikelySpam(lead({ customerName: "Cher", customerEmail: "cher@example.com" }))
    ).toBeNull();
  });
});
