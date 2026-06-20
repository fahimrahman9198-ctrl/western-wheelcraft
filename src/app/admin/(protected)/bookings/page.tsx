import {
  CalendarDays,
  Car,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  Wrench,
} from 'lucide-react';
import { getAdminBookingsData } from '@/lib/admin-data';
import { BookingWorkflowControls } from '@/components/admin/WorkflowControls';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-green-500/15 text-green-400 border-green-500/30',
  completed: 'bg-brand-ash/40 text-brand-silver border-brand-ash/50',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const slotLabels: Record<string, string> = {
  shop: 'Shop Bay',
  mobile_1: 'Mobile Truck 1',
  mobile_2: 'Mobile Truck 2',
};

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-CA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatMoney(value: string | null): string {
  if (!value) return 'No amount';
  return Number(value).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
}

function vehicleLabel(booking: Awaited<ReturnType<typeof getAdminBookingsData>>[number]): string {
  if (booking.vehicle) {
    return [booking.vehicle.year, booking.vehicle.make, booking.vehicle.model].filter(Boolean).join(' ');
  }

  const vehicleLine = booking.notes
    ?.split('\n')
    .find((line) => line.toLowerCase().startsWith('vehicle:'));

  return vehicleLine?.replace(/^vehicle:\s*/i, '') ?? 'Vehicle not provided';
}

export default async function AdminBookingsPage() {
  const bookings = await getAdminBookingsData();
  const pendingCount = bookings.filter((booking) => booking.status === 'pending').length;
  const confirmedCount = bookings.filter((booking) => booking.status === 'confirmed').length;
  const mobileCount = bookings.filter((booking) => booking.serviceType === 'mobile').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-display-sm text-brand-white">Bookings</h1>
          <p className="mt-1 text-body-sm text-brand-silver">
            Confirm, reschedule, price, and track real booking requests saved in Neon.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Pending', pendingCount],
            ['Confirmed', confirmedCount],
            ['Mobile', mobileCount],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-brand-graphite bg-brand-jet-light px-4 py-3">
              <p className="font-mono text-body-md text-brand-white">{value}</p>
              <p className="text-caption text-brand-silver">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-brand-graphite bg-brand-jet-light px-6 py-16 text-center">
          <CalendarDays className="mx-auto text-brand-ash" size={36} />
          <h2 className="mt-4 font-display text-body-lg text-brand-white">No booking requests yet</h2>
          <p className="mx-auto mt-2 max-w-md text-body-sm text-brand-silver">
            Public booking requests will appear here after the booking form is submitted.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-xl border border-brand-graphite bg-brand-jet-light p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-body-lg text-brand-white">
                      {booking.customer.name}
                    </h2>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-caption font-medium capitalize ${STATUS_COLORS[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                    <span className="rounded-full border border-brand-graphite bg-brand-graphite px-2.5 py-0.5 text-caption text-brand-silver">
                      {slotLabels[booking.slot] ?? booking.slot}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-caption text-brand-silver">
                    {booking.bookingNumber} · Requested {booking.createdAt.toLocaleDateString('en-CA')}
                  </p>
                </div>
                <div className="font-display text-display-sm text-brand-white">
                  {formatMoney(booking.amount)}
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-body-sm text-brand-smoke md:grid-cols-2 xl:grid-cols-4">
                <a href={`mailto:${booking.customer.email}`} className="flex items-center gap-2 hover:text-brand-red">
                  <Mail size={14} className="text-brand-red" />
                  <span className="truncate">{booking.customer.email}</span>
                </a>
                {booking.customer.phone ? (
                  <a href={`tel:${booking.customer.phone}`} className="flex items-center gap-2 hover:text-brand-red">
                    <Phone size={14} className="text-brand-red" />
                    <span>{booking.customer.phone}</span>
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-brand-silver">
                    <Phone size={14} /> No phone
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-brand-red" />
                  {formatDate(booking.scheduledDate)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={14} className="text-brand-red" />
                  {booking.startTime}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-brand-graphite bg-brand-graphite/40 p-4">
                  <div className="mb-2 flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-brand-ash">
                    <Wrench size={13} /> Service
                  </div>
                  <p className="text-body-sm text-brand-white">{booking.service}</p>
                  <p className="mt-1 text-caption text-brand-silver">
                    {booking.serviceType === 'mobile' ? 'Mobile service request' : 'Shop drop-off request'}
                  </p>
                </div>

                <div className="rounded-lg border border-brand-graphite bg-brand-graphite/40 p-4">
                  <div className="mb-2 flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-brand-ash">
                    <Car size={13} /> Vehicle / Region
                  </div>
                  <p className="text-body-sm text-brand-white">{vehicleLabel(booking)}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-caption text-brand-silver">
                    <MapPin size={12} /> {booking.region ?? 'Region not provided'}
                  </p>
                </div>
              </div>

              {booking.notes && (
                <div className="mt-4 rounded-lg border border-brand-graphite bg-brand-graphite/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-brand-ash">
                    <FileText size={13} /> Notes
                  </div>
                  <p className="whitespace-pre-line text-body-sm leading-relaxed text-brand-silver">
                    {booking.notes}
                  </p>
                </div>
              )}

              <BookingWorkflowControls
                bookingId={booking.id}
                status={booking.status}
                amount={booking.amount}
                scheduledDate={booking.scheduledDate}
                startTime={booking.startTime}
                activities={booking.activities.map((activity) => ({
                  ...activity,
                  createdAt: activity.createdAt.toISOString(),
                }))}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
