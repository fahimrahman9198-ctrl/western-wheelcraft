'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Phone, Mail, Calendar } from 'lucide-react';

interface BookingsListViewProps {
  bookings: any[];
  onEditBooking?: (booking: any) => void;
  onDeleteBooking?: (booking: any) => void;
  onStatusChange?: (booking: any, newStatus: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-green-500/15 text-green-400 border-green-500/30',
  completed: 'bg-brand-ash/40 text-brand-silver border-brand-ash/50',
  cancelled: 'bg-brand-red/15 text-brand-red border-brand-red/30',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function BookingsListView({
  bookings,
  onEditBooking,
  onDeleteBooking,
  onStatusChange,
}: BookingsListViewProps) {
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-brand-graphite bg-brand-jet-light px-6 py-16 text-center">
        <Calendar className="mx-auto text-brand-ash" size={36} />
        <h2 className="mt-4 font-display text-body-lg text-brand-white">No bookings yet</h2>
        <p className="mx-auto mt-2 max-w-md text-body-sm text-brand-silver">
          Bookings will appear here as they are created or imported.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border border-brand-graphite">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-ash bg-brand-graphite/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-white">
                Booking #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-white">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-white">
                Service
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-white">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-white">
                Slot
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-white">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-white">
                Amount
              </th>
              <th className="relative px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-graphite">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-brand-graphite/30 transition-colors">
                <td className="px-4 py-3 text-sm font-mono text-brand-white">
                  #{booking.bookingNumber}
                </td>
                <td className="px-4 py-3 text-sm text-brand-white">
                  <div>
                    <p className="font-medium">{booking.customer?.name}</p>
                    <div className="flex flex-col gap-1 mt-1 text-xs text-brand-silver">
                      {booking.customer?.phone && (
                        <a
                          href={`tel:${booking.customer.phone}`}
                          className="flex items-center gap-1 hover:text-brand-red"
                        >
                          <Phone className="w-3 h-3" />
                          {booking.customer.phone}
                        </a>
                      )}
                      {booking.customer?.email && (
                        <a
                          href={`mailto:${booking.customer.email}`}
                          className="flex items-center gap-1 hover:text-brand-red"
                        >
                          <Mail className="w-3 h-3" />
                          {booking.customer.email}
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-brand-smoke">
                  {booking.serviceType}
                </td>
                <td className="px-4 py-3 text-sm text-brand-smoke">
                  <p>{format(new Date(booking.scheduledDate), 'MMM dd, yyyy')}</p>
                  <p className="text-xs text-brand-ash mt-1">
                    {booking.startTime} – {booking.endTime}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm text-brand-white capitalize">
                  {booking.slot}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      STATUS_COLORS[booking.status] || 'bg-brand-graphite text-brand-silver'
                    }`}
                  >
                    {STATUS_LABELS[booking.status] || booking.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-mono text-brand-white">
                  ${booking.amount}
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() =>
                      setExpandedBookingId(
                        expandedBookingId === booking.id ? null : booking.id
                      )
                    }
                    className="p-2 hover:bg-brand-graphite rounded transition-colors text-brand-smoke hover:text-brand-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {expandedBookingId === booking.id && (
                    <div className="absolute right-4 top-full mt-1 bg-brand-jet border border-brand-graphite rounded-lg shadow-lg z-10">
                      {booking.status !== 'confirmed' && (
                        <button
                          onClick={() => {
                            onStatusChange?.(booking, 'confirmed');
                            setExpandedBookingId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-brand-smoke hover:text-brand-white hover:bg-brand-graphite first:rounded-t-lg transition-colors border-b border-brand-graphite/50 last:border-b-0"
                        >
                          Confirm
                        </button>
                      )}
                      {booking.status !== 'completed' && (
                        <button
                          onClick={() => {
                            onStatusChange?.(booking, 'completed');
                            setExpandedBookingId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-brand-smoke hover:text-brand-white hover:bg-brand-graphite transition-colors border-b border-brand-graphite/50 last:border-b-0"
                        >
                          Mark Complete
                        </button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            onStatusChange?.(booking, 'cancelled');
                            setExpandedBookingId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 last:rounded-b-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
