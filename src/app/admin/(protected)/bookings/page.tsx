import { CalendarDays } from 'lucide-react';
import { getAdminBookingsData, getAdminCustomersData } from '@/lib/admin-data';
import { BookingsTabsClient } from '@/components/admin/BookingsTabsClient';

export default async function AdminBookingsPage() {
  const [bookings, customers] = await Promise.all([getAdminBookingsData(), getAdminCustomersData()]);

  const pendingCount = bookings.filter((booking) => booking.status === 'pending').length;
  const confirmedCount = bookings.filter((booking) => booking.status === 'confirmed').length;
  const mobileCount = bookings.filter((booking) => booking.serviceType === 'mobile').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-display-sm text-brand-white">Bookings</h1>
          <p className="mt-1 text-body-sm text-brand-smoke">
            Confirm, reschedule, price, and track real booking requests saved in Neon.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Pending', pendingCount],
            ['Confirmed', confirmedCount],
            ['Mobile', mobileCount],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-brand-ash bg-brand-graphite px-4 py-3">
              <p className="font-mono text-body-md text-brand-white">{value}</p>
              <p className="text-caption text-brand-smoke">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-brand-ash bg-brand-graphite px-6 py-16 text-center">
          <CalendarDays className="mx-auto text-brand-silver" size={36} />
          <h2 className="mt-4 font-display text-body-lg text-brand-white">No booking requests yet</h2>
          <p className="mx-auto mt-2 max-w-md text-body-sm text-brand-smoke">
            Public booking requests will appear here after the booking form is submitted.
          </p>
        </div>
      ) : (
        <BookingsTabsClient bookings={bookings} customers={customers} />
      )}
    </div>
  );
}
