'use client';

import { useState, useCallback } from 'react';
import { Car, Clock, FileText, Mail, MapPin, Phone, Wrench } from 'lucide-react';
import type { Booking } from '@/lib/db/schema';
import { BookingWorkflowControls } from './WorkflowControls';
import { BookingCalendar } from './BookingCalendar';
import { CreateBookingModal } from './CreateBookingModal';
import { toast } from 'sonner';

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

interface BookingsTabsClientProps {
  bookings: any[];
  customers: any[];
}

function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  return date.toLocaleDateString('en-CA', {
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

function vehicleLabel(booking: Booking & { vehicle?: any }): string {
  if (booking.vehicle) {
    return [booking.vehicle.year, booking.vehicle.make, booking.vehicle.model].filter(Boolean).join(' ');
  }
  return 'Vehicle not provided';
}

type TabType = 'calendar' | 'list';

export function BookingsTabsClient({ bookings, customers }: BookingsTabsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlotStart, setSelectedSlotStart] = useState<Date | null>(null);
  const [selectedSlotEnd, setSelectedSlotEnd] = useState<Date | null>(null);

  const handleSelectSlot = useCallback((start: Date, end: Date) => {
    setSelectedSlotStart(start);
    setSelectedSlotEnd(end);
    setIsModalOpen(true);
  }, []);

  const handleSelectEvent = useCallback((booking: Booking) => {
    // Just scroll to the booking in list view
    setActiveTab('list');
    const element = document.getElementById(`booking-${booking.id}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleCreateBooking = async (data: any) => {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      toast.success('Booking created successfully');
      setIsModalOpen(false);

      // Trigger page refresh
      window.location.reload();
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-brand-graphite">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'calendar'
              ? 'border-b-2 border-brand-red text-brand-white'
              : 'text-brand-silver hover:text-brand-white'
          }`}
        >
          📅 Calendar
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'border-b-2 border-brand-red text-brand-white'
              : 'text-brand-silver hover:text-brand-white'
          }`}
        >
          📋 List View
        </button>
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="rounded-lg border border-brand-graphite bg-brand-jet-light p-4">
          <BookingCalendar
            bookings={bookings}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
          <button
            onClick={() => {
              setSelectedSlotStart(null);
              setSelectedSlotEnd(null);
              setIsModalOpen(true);
            }}
            className="mt-4 px-4 py-2 bg-brand-red hover:bg-brand-red-hover text-white rounded font-medium transition-colors"
          >
            + New Booking
          </button>
        </div>
      )}

      {/* List Tab */}
      {activeTab === 'list' && (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              id={`booking-${booking.id}`}
              className="rounded-xl border border-brand-graphite bg-brand-jet-light p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-body-lg text-brand-white">{booking.customer.name}</h2>
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
                    {booking.bookingNumber} · Requested {formatDate(booking.createdAt)}
                  </p>
                </div>
                <div className="font-display text-display-sm text-brand-white">
                  {formatMoney(booking.amount)}
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-body-sm text-brand-smoke md:grid-cols-2 xl:grid-cols-4">
                <a
                  href={`mailto:${booking.customer.email}`}
                  className="flex items-center gap-2 hover:text-brand-red"
                >
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
                  <Clock size={14} className="text-brand-red" />
                  {formatDate(booking.scheduledDate)} {booking.startTime}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-brand-graphite bg-brand-graphite/40 p-4">
                  <div className="mb-2 flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-brand-ash">
                    <Wrench size={13} /> Service
                  </div>
                  <p className="text-body-sm text-brand-white">{booking.service}</p>
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
                activities={booking.activities.map((activity: any) => ({
                  ...activity,
                  createdAt:
                    activity.createdAt instanceof Date ? activity.createdAt.toISOString() : activity.createdAt,
                }))}
              />
            </article>
          ))}
        </div>
      )}

      {/* Create Booking Modal */}
      <CreateBookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlotStart(null);
          setSelectedSlotEnd(null);
        }}
        onSubmit={handleCreateBooking}
        customers={customers}
        existingBookings={bookings}
        prefilledDate={selectedSlotStart || undefined}
      />
    </div>
  );
}
