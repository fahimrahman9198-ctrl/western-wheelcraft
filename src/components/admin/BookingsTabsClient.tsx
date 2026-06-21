'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { CreateBookingModal } from './CreateBookingModal';
import { BookingsListView } from './BookingsListView';

interface BookingsTabsClientProps {
  bookings: any[];
  customers: any[];
  onBookingsUpdated?: () => void;
}

export function BookingsTabsClient({
  bookings,
  customers,
  onBookingsUpdated,
}: BookingsTabsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localBookings, setLocalBookings] = useState(bookings);

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

      const newBooking = await response.json();
      setLocalBookings([newBooking, ...localBookings]);
      toast.success('Booking created successfully');

      if (onBookingsUpdated) {
        onBookingsUpdated();
      }
    } catch (error) {
      throw error;
    }
  };

  const handleStatusChange = async (booking: any, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      setLocalBookings(
        localBookings.map((b) =>
          b.id === booking.id ? { ...b, status: newStatus } : b
        )
      );
      toast.success(`Booking marked as ${newStatus}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update booking');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with New Booking Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-display-sm text-brand-white">Bookings</h1>
          <p className="mt-1 text-body-sm text-brand-silver">
            Manage wheel repair appointments and service bookings
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-red hover:bg-brand-red-hover rounded-lg text-white font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      {/* Bookings List */}
      <BookingsListView
        bookings={localBookings}
        onStatusChange={handleStatusChange}
      />

      {/* Create Booking Modal */}
      <CreateBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBooking}
        customers={customers}
        existingBookings={localBookings}
      />
    </div>
  );
}
