'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Customer, Booking } from '@/lib/db/schema';
import { findConflicts, SERVICE_DURATIONS, generateTimeSlots } from '@/lib/booking-utils';

const CreateBookingSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  slot: z.enum(['shop', 'mobile_1', 'mobile_2']),
  region: z.string().min(1, 'Region is required'),
  scheduledDate: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional(),
});

type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBookingInput) => Promise<void>;
  customers: any[];
  existingBookings: any[];
  prefilledDate?: Date;
  prefilledCustomerId?: string;
}

const SERVICES = [
  'Wheel refinishing',
  'Curb rash repair',
  'Full detail',
  'Mobile service',
];

const REGIONS = ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Coquitlam', 'Other'];

export function CreateBookingModal({
  isOpen,
  onClose,
  onSubmit,
  customers,
  existingBookings,
  prefilledDate,
  prefilledCustomerId,
}: CreateBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflict, setConflict] = useState<Booking | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateBookingInput>({
    resolver: zodResolver(CreateBookingSchema),
    defaultValues: {
      customerId: prefilledCustomerId || '',
      scheduledDate: prefilledDate ? format(prefilledDate, 'yyyy-MM-dd') : '',
      startTime: '09:00',
      endTime: '10:30',
      amount: 250,
      notes: '',
    },
  });

  const selectedService = watch('serviceType');
  const startTime = watch('startTime');
  const serviceType = watch('serviceType');
  const slot = watch('slot');
  const scheduledDate = watch('scheduledDate');

  // Auto-calculate end time based on service duration
  if (selectedService && startTime) {
    const duration = SERVICE_DURATIONS[selectedService] || 60;
    const [hours, mins] = startTime.split(':').map(Number);
    const endMinutes = hours * 60 + mins + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const calculatedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    if (calculatedEndTime !== watch('endTime')) {
      setValue('endTime', calculatedEndTime);
    }
  }

  // Check for conflicts
  if (slot && scheduledDate && startTime && watch('endTime')) {
    const conflicts = findConflicts(existingBookings, {
      slot,
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime: watch('endTime'),
    });
    setConflict(conflicts[0] || null);
  }

  const handleFormSubmit = async (data: CreateBookingInput) => {
    if (conflict) {
      toast.error('Cannot book: Time slot already occupied');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success('Booking created successfully');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const timeSlots = generateTimeSlots();

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-brand-jet rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-brand-graphite">
        <div className="sticky top-0 border-b border-brand-graphite bg-brand-jet-light p-4">
          <h2 className="text-lg font-bold text-brand-white">Create New Booking</h2>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 space-y-4">
          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-brand-white mb-1">
              Customer
            </label>
            <select
              {...register('customerId')}
              className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white"
            >
              <option value="">Select customer...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-red-400 text-xs mt-1">{errors.customerId.message}</p>
            )}
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-brand-white mb-1">
              Service Type
            </label>
            <select
              {...register('serviceType')}
              className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white"
            >
              <option value="">Select service...</option>
              {SERVICES.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
            {errors.serviceType && (
              <p className="text-red-400 text-xs mt-1">{errors.serviceType.message}</p>
            )}
          </div>

          {/* Slot */}
          <div>
            <label className="block text-sm font-medium text-brand-white mb-1">
              Slot
            </label>
            <select
              {...register('slot')}
              className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white"
            >
              <option value="">Select slot...</option>
              <option value="shop">Shop</option>
              <option value="mobile_1">Mobile 1</option>
              <option value="mobile_2">Mobile 2</option>
            </select>
            {errors.slot && (
              <p className="text-red-400 text-xs mt-1">{errors.slot.message}</p>
            )}
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-brand-white mb-1">
              Region
            </label>
            <select
              {...register('region')}
              className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white"
            >
              <option value="">Select region...</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {errors.region && (
              <p className="text-red-400 text-xs mt-1">{errors.region.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-brand-white mb-1">
              Scheduled Date
            </label>
            <input
              type="date"
              {...register('scheduledDate')}
              className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white"
            />
            {errors.scheduledDate && (
              <p className="text-red-400 text-xs mt-1">{errors.scheduledDate.message}</p>
            )}
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-white mb-1">
                Start Time
              </label>
              <select
                {...register('startTime')}
                className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white"
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-white mb-1">
                End Time
              </label>
              <input
                type="text"
                {...register('endTime')}
                readOnly
                className="w-full px-3 py-2 bg-brand-graphite-light border border-brand-graphite-light rounded text-brand-silver cursor-not-allowed"
              />
            </div>
          </div>

          {/* Conflict Warning */}
          {conflict && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-400">
                <p className="font-semibold">Conflict detected</p>
                <p>
                  {(conflict as any).customer?.name || 'Customer'} already booked {(conflict as any).startTime} – {(conflict as any).endTime}
                </p>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-brand-white mb-1">
              Estimated Amount
            </label>
            <input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white"
            />
            {errors.amount && (
              <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-brand-white mb-1">
              Notes (optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white resize-none"
              placeholder="Add any special notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-brand-graphite">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-brand-graphite rounded text-brand-smoke hover:text-brand-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!conflict}
              className="flex-1 px-4 py-2 bg-brand-red rounded text-white font-medium hover:bg-brand-red-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
