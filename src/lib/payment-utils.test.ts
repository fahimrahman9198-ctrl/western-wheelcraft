import { describe, it, expect } from "vitest";
import { calcInvoiceTotals, calcFixedWheelPricing, GST_RATE, PST_RATE } from "./payment-utils";

describe("calcInvoiceTotals", () => {
  it("applies 5% GST and 7% PST", () => {
    const { gst, pst, total } = calcInvoiceTotals(100);
    expect(gst).toBeCloseTo(5);
    expect(pst).toBeCloseTo(7);
    expect(total).toBeCloseTo(112);
  });

  it("returns zeros for a zero subtotal", () => {
    expect(calcInvoiceTotals(0)).toEqual({ gst: 0, pst: 0, total: 0 });
  });

  it("uses the exported tax rates", () => {
    const subtotal = 380;
    const { gst, pst } = calcInvoiceTotals(subtotal);
    expect(gst).toBeCloseTo(subtotal * GST_RATE);
    expect(pst).toBeCloseTo(subtotal * PST_RATE);
  });
});

describe("calcFixedWheelPricing", () => {
  it("prices a single wheel at $250 with no bulk discount", () => {
    const p = calcFixedWheelPricing(1);
    expect(p.subtotal).toBe(250);
    expect(p.discountAmount).toBe(0);
    expect(p.gst).toBeCloseTo(12.5);
    expect(p.pst).toBeCloseTo(17.5);
    expect(p.total).toBeCloseTo(280);
    expect(p.wheels).toHaveLength(1);
  });

  it("applies a $200 bulk discount at four wheels", () => {
    const p = calcFixedWheelPricing(4);
    // 4 * 250 = 1000, minus 200 bulk = 800 subtotal
    expect(p.subtotal).toBe(800);
    expect(p.discountAmount).toBe(200);
    expect(p.total).toBeCloseTo(896); // 800 + 40 gst + 56 pst
    expect(p.wheels).toHaveLength(4);
  });

  it("keeps the bulk discount for more than four wheels", () => {
    const p = calcFixedWheelPricing(5);
    expect(p.subtotal).toBe(5 * 250 - 200);
    expect(p.discountAmount).toBe(200);
  });
});
