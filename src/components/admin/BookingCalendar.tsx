'use client';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { AdminBooking } from '@/lib/admin-types';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface BookingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    booking: AdminBooking;
    statusColor: string;
  };
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'bg-green-500';
    case 'pending':
      return 'bg-yellow-500';
    case 'completed':
      return 'bg-blue-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

function convertBookingsToEvents(bookings: AdminBooking[]): BookingEvent[] {
  return bookings.map((booking) => ({
    id: booking.id,
    title: `${booking.customer?.name || 'Unknown'} - ${booking.serviceType || booking.service} (${booking.slot})`,
    start: new Date(`${booking.scheduledDate}T${booking.startTime}`),
    end: new Date(`${booking.scheduledDate}T${booking.endTime}`),
    resource: {
      booking,
      statusColor: getStatusColor(booking.status),
    },
  }));
}

interface BookingCalendarProps {
  bookings: AdminBooking[];
  onSelectEvent: (booking: AdminBooking) => void;
  onSelectSlot: (start: Date, end: Date) => void;
  onNavigate?: (date: Date) => void;
}

export function BookingCalendar({
  bookings,
  onSelectEvent,
  onSelectSlot,
  onNavigate,
}: BookingCalendarProps) {
  const events = convertBookingsToEvents(bookings);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    onSelectSlot(slotInfo.start, slotInfo.end);
  };

  const handleSelectEvent = (event: BookingEvent) => {
    onSelectEvent(event.resource.booking);
  };

  const EventStyleGetter = (event: BookingEvent) => {
    return {
      style: {
        backgroundColor: event.resource.statusColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="h-full bg-white rounded-lg border border-brand-ash overflow-hidden">
      <Calendar<BookingEvent>
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        popup
        eventPropGetter={EventStyleGetter}
        onNavigate={onNavigate}
        defaultView="month"
        views={['month', 'week', 'day']}
        step={30}
        timeslots={2}
      />
    </div>
  );
}
