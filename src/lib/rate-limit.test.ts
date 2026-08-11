import { describe, it, expect } from "vitest";
import { checkRateLimit } from "./rate-limit";

// Each test uses a unique IP because the limiter keeps a shared in-memory store.
describe("checkRateLimit", () => {
  it("allows the first request and reports remaining budget", () => {
    const r = checkRateLimit("ip-first");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(9);
  });

  it("allows exactly 10 requests then blocks the 11th", () => {
    const ip = "ip-burst";
    const results = Array.from({ length: 10 }, () => checkRateLimit(ip));
    expect(results.every((r) => r.allowed)).toBe(true);
    expect(results[9].remaining).toBe(0);

    const blocked = checkRateLimit(ip);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("tracks separate budgets per IP", () => {
    checkRateLimit("ip-a");
    const b = checkRateLimit("ip-b");
    expect(b.remaining).toBe(9);
  });

  it("returns a future reset time", () => {
    const r = checkRateLimit("ip-reset");
    expect(r.resetTime).toBeGreaterThan(Date.now());
  });
});
