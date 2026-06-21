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
import { getAdminCustomersData } from '@/lib/admin-data';
import { BookingWorkflowControls } from '@/components/admin/WorkflowControls';
import { BookingsTabsClient } from '@/components/admin/BookingsTabsClient';

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

function vehicleLabel(booking: any): string {
  if (booking.vehicle) {
    return [booking.vehicle.year, booking.vehicle.make, booking.vehicle.model].filter(Boolean).join(' ');
  }

  const vehicleLine = booking.notes
    ?.split('\n')
    .find((line: string) => line.toLowerCase().startsWith('vehicle:'));

  return vehicleLine?.replace(/^vehicle:\s*/i, '') ?? 'Vehicle not provided';
}

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
        <BookingsTabsClient bookings={bookings as any} customers={customers as any} />
      )}
    </div>
  );
}
