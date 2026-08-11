import { describe, it, expect } from "vitest";
import type { Booking } from "./db/schema";
import {
  findConflicts,
  durationInMinutes,
  to24Hour,
  publicSlotsForDate,
  PUBLIC_SLOTS_SUNDAY,
  PUBLIC_SLOTS_WEEKDAY,
} from "./booking-utils";

// findConflicts only reads id/slot/scheduledDate/startTime/endTime, so build
// minimal rows and present them as Booking to the generic signature.
function booking(fields: {
  id: string;
  slot: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
}): Booking {
  return fields as unknown as Booking;
}

const day = new Date(2026, 7, 11); // Aug 11, 2026 (local)

describe("findConflicts", () => {
  // Stored bookings keep scheduledDate as a string; use the same instant as
  // `day` so both resolve to the same calendar day regardless of timezone.
  const existing = booking({
    id: "b1",
    slot: "shop",
    scheduledDate: day.toISOString(),
    startTime: "10:00",
    endTime: "11:00",
  });

  it("detects an overlapping booking in the same slot and day", () => {
    const conflicts = findConflicts([existing], {
      slot: "shop",
      scheduledDate: day,
      startTime: "10:30",
      endTime: "11:30",
    });
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].id).toBe("b1");
  });

  it("does not conflict when times are adjacent but not overlapping", () => {
    const conflicts = findConflicts([existing], {
      slot: "shop",
      scheduledDate: day,
      startTime: "11:00",
      endTime: "12:00",
    });
    expect(conflicts).toHaveLength(0);
  });

  it("does not conflict across different slots", () => {
    const conflicts = findConflicts([existing], {
      slot: "mobile_1",
      scheduledDate: day,
      startTime: "10:30",
      endTime: "11:30",
    });
    expect(conflicts).toHaveLength(0);
  });

  it("does not conflict on a different day", () => {
    const conflicts = findConflicts([existing], {
      slot: "shop",
      scheduledDate: new Date(2026, 7, 12),
      startTime: "10:30",
      endTime: "11:30",
    });
    expect(conflicts).toHaveLength(0);
  });

  it("excludes the booking being edited", () => {
    const conflicts = findConflicts([existing], {
      slot: "shop",
      scheduledDate: day,
      startTime: "10:30",
      endTime: "11:30",
      excludeBookingId: "b1",
    });
    expect(conflicts).toHaveLength(0);
  });
});

describe("durationInMinutes", () => {
  it("computes a same-hour span", () => {
    expect(durationInMinutes("09:00", "09:45")).toBe(45);
  });

  it("computes a multi-hour span", () => {
    expect(durationInMinutes("09:00", "11:30")).toBe(150);
  });
});

describe("to24Hour", () => {
  it("converts PM times", () => {
    expect(to24Hour("1:00 PM")).toBe("13:00");
  });

  it("converts 12 AM to midnight", () => {
    expect(to24Hour("12:00 AM")).toBe("00:00");
  });

  it("keeps 12 PM as noon", () => {
    expect(to24Hour("12:00 PM")).toBe("12:00");
  });

  it("returns the input unchanged when it is not a 12-hour label", () => {
    expect(to24Hour("14:00")).toBe("14:00");
  });
});

describe("publicSlotsForDate", () => {
  it("returns the reduced Sunday slot list on a Sunday", () => {
    // 2026-08-16 is a Sunday.
    expect(publicSlotsForDate("2026-08-16")).toEqual(PUBLIC_SLOTS_SUNDAY);
  });

  it("returns weekday slots on a weekday", () => {
    // 2026-08-11 is a Tuesday.
    expect(publicSlotsForDate("2026-08-11")).toEqual(PUBLIC_SLOTS_WEEKDAY);
  });
});
