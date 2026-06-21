import type { Booking } from './db/schema';
import { isAfter, isBefore, parse } from 'date-fns';

export interface ConflictCheckInput {
  slot: string;
  scheduledDate: Date;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  excludeBookingId?: string; // Exclude when editing
}

export function findConflicts(
  allBookings: Booking[],
  newBooking: ConflictCheckInput
): Booking[] {
  const newStart = parse(newBooking.startTime, 'HH:mm', newBooking.scheduledDate);
  const newEnd = parse(newBooking.endTime, 'HH:mm', newBooking.scheduledDate);

  return allBookings.filter((booking) => {
    // Skip if checking same booking (editing scenario)
    if (newBooking.excludeBookingId && booking.id === newBooking.excludeBookingId) {
      return false;
    }

    // Different slot = no conflict
    if (booking.slot !== newBooking.slot) {
      return false;
    }

    // Different date = no conflict
    const bookingDate = new Date(booking.scheduledDate);
    const newDate = new Date(newBooking.scheduledDate);
    if (bookingDate.toDateString() !== newDate.toDateString()) {
      return false;
    }

    // Check if times overlap
    const bookingStart = parse(booking.startTime, 'HH:mm', bookingDate);
    const bookingEnd = booking.endTime ? parse(booking.endTime, 'HH:mm', bookingDate) : bookingStart;

    // Overlap occurs if: newStart < bookingEnd AND newEnd > bookingStart
    return isBefore(newStart, bookingEnd) && isAfter(newEnd, bookingStart);
  });
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`;
}

export function durationInMinutes(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;

  return endTotalMin - startTotalMin;
}

export const SERVICE_DURATIONS: Record<string, number> = {
  'Wheel refinishing': 120, // 2 hours
  'Curb rash repair': 90, // 1.5 hours
  'Full detail': 180, // 3 hours
  'Mobile service': 150, // 2.5 hours
};

export const WORK_HOURS = {
  start: '08:00',
  end: '17:00',
  interval: 30, // minutes
};

export function generateTimeSlots(start: string = WORK_HOURS.start, end: string = WORK_HOURS.end): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  let current = startHour * 60 + startMin;
  const endTotal = endHour * 60 + endMin;

  while (current <= endTotal) {
    const hours = Math.floor(current / 60);
    const mins = current % 60;
    slots.push(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
    current += WORK_HOURS.interval;
  }

  return slots;
}
