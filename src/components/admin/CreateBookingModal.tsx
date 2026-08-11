'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { AlertCircle, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { AdminBooking, AdminCustomer } from '@/lib/admin-types';
import { findConflicts, SERVICE_DURATIONS, generateTimeSlots } from '@/lib/booking-utils';
import { DatePickerModal } from './DatePickerModal';

const CreateBookingSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  customerPhone: z.string().optional().or(z.literal('')),
  customerEmail: z.string().email().optional().or(z.literal('')),
  serviceType: z.string().min(1, 'Service type is required'),
  slot: z.enum(['shop', 'island', 'kamloops']),
  region: z.string().min(1, 'Region is required'),
  scheduledDate: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBookingInput) => Promise<void>;
  customers: AdminCustomer[];
  existingBookings: AdminBooking[];
  prefilledDate?: Date;
  prefilledCustomerId?: string;
  onCustomerCreated?: (customer: AdminCustomer) => void;
}

const SERVICES = [
  'Wheel refinishing',
  'Curb rash repair',
  'Full detail',
  'Mobile service',
];

const REGIONS = [
  'Vancouver',
  'Victoria',
  'Nanaimo',
  'Duncan',
  'Okanagan',
  'Kamloops',
  'Kelowna',
  'Surrey',
  'Burnaby',
  'Richmond',
  'Coquitlam',
  'Other',
];

export function CreateBookingModal({
  isOpen,
  onClose,
  onSubmit,
  customers,
  existingBookings,
  prefilledDate,
  prefilledCustomerId,
  onCustomerCreated,
}: CreateBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflict, setConflict] = useState<AdminBooking | null>(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', email: '', phone: '' });
  const [localCustomers, setLocalCustomers] = useState(customers);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
      customerPhone: '',
      customerEmail: '',
    },
  });

  const selectedCustomerId = watch('customerId');
  const selectedService = watch('serviceType');
  const startTime = watch('startTime');
  const slot = watch('slot');
  const scheduledDate = watch('scheduledDate');
  const selectedCustomer = localCustomers.find((c) => c.id === selectedCustomerId);

  // Auto-fill phone and email from selected customer
  if (selectedCustomer && !watch('customerPhone')) {
    if (selectedCustomer.phone) {
      setValue('customerPhone', selectedCustomer.phone);
    }
    if (selectedCustomer.email) {
      setValue('customerEmail', selectedCustomer.email);
    }
  }

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

  const handleCreateQuickCustomer = async () => {
    if (!newCustomerForm.name.trim() || !newCustomerForm.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustomerForm.name,
          email: newCustomerForm.email,
          phone: newCustomerForm.phone || null,
          type: 'individual',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create customer');
      }

      const newCustomer = await response.json();
      setLocalCustomers([newCustomer, ...localCustomers]);
      setValue('customerId', newCustomer.id);
      setValue('customerPhone', newCustomer.phone || '');
      setValue('customerEmail', newCustomer.email || '');
      setNewCustomerForm({ name: '', email: '', phone: '' });
      setShowNewCustomerForm(false);
      toast.success('Customer created successfully');

      if (onCustomerCreated) {
        onCustomerCreated(newCustomer);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create customer');
    }
  };

  const handleDateSelect = (date: Date) => {
    setValue('scheduledDate', format(date, 'yyyy-MM-dd'));
  };

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
    <>
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-brand-jet rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-brand-ash">
          <div className="sticky top-0 border-b border-brand-ash bg-brand-graphite p-4">
            <h2 className="text-lg font-bold text-brand-white">Create New Booking</h2>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 space-y-4">
            {/* Customer */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-brand-white">
                  Customer
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
                  className="text-xs text-brand-red hover:text-brand-red-hover underline"
                >
                  + New Customer
                </button>
              </div>

              {!showNewCustomerForm ? (
                <>
                  <select
                    {...register('customerId')}
                    className="w-full px-3 py-2 bg-brand-graphite-light border border-brand-ash rounded text-brand-white"
                  >
                    <option value="">Select customer...</option>
                    {localCustomers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.email})
                      </option>
                    ))}
                  </select>
                  {errors.customerId && (
                    <p className="text-red-400 text-xs mt-1">{errors.customerId.message}</p>
                  )}
                </>
              ) : (
                <div className="space-y-2 p-3 bg-brand-graphite-light/30 rounded border border-brand-ash">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    className="w-full px-2 py-2 bg-brand-graphite-light border border-brand-ash rounded text-brand-white text-sm placeholder:text-brand-silver"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                    className="w-full px-2 py-2 bg-brand-graphite-light border border-brand-ash rounded text-brand-white text-sm placeholder:text-brand-silver"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    className="w-full px-2 py-2 bg-brand-graphite-light border border-brand-ash rounded text-brand-white text-sm placeholder:text-brand-silver"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateQuickCustomer}
                      className="flex-1 px-2 py-1 bg-brand-red hover:bg-brand-red-hover rounded text-white text-sm font-medium"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewCustomerForm(false)}
                      className="flex-1 px-2 py-1 bg-brand-graphite-light hover:bg-brand-graphite-light/80 rounded text-brand-smoke text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Phone and Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-brand-white mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  {...register('customerPhone')}
                  className="w-full px-3 py-2 bg-brand-graphite-light border border-brand-ash rounded text-brand-white placeholder:text-brand-silver"
                  placeholder="(604) 555-0001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-white mb-1">
                  Email
                </label>
                <input
                  type="email"
                  {...register('customerEmail')}
                  className="w-full px-3 py-2 bg-brand-graphite-light border border-brand-ash rounded text-brand-white placeholder:text-brand-silver"
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-brand-white mb-1">
                Service Type
              </label>
              <select
                {...register('serviceType')}
                className="w-full px-3 py-2 bg-brand-graphite-light border border-brand-ash rounded text-brand-white"
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
                className="w-full px-3 py-2 bg-brand-graphite-light border border-brand-ash rounded text-brand-white"
              >
                <option value="">Select slot...</option>
                <option value="shop">Shop</option>
                <option value="island">Island</option>
                <option value="kamloops">Kamloops</option>
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
                className="w-full px-3 py-2 bg-brand-graphite-light border border-brand-ash rounded text-brand-white"
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

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-brand-white mb-1">
                Scheduled Date
              </label>
              <button
                type="button"
                onClick={() => setShowDatePicker(true)}
                className="w-full px-3 py-2 bg-brand-graphite-light border border-brand-ash rounded text-brand-white hover:border-brand-red/50 transition-colors flex items-center justify-between"
              >
                <span>
                  {scheduledDate ? format(new Date(scheduledDate), 'MMM dd, yyyy') : 'Select Date'}
                </span>
                <Calendar className="w-4 h-4 text-brand-red" />
              </button>
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
                  className="w-full px-3 py-2 bg-brand-graphite-light border border-brand-ash rounded text-brand-white"
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
                  className="w-full px-3 py-2 bg-brand-graphite-light border border-brand-ash rounded text-brand-smoke cursor-not-allowed"
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
                    {conflict.customer?.name || 'Customer'} already booked {conflict.startTime} – {conflict.endTime}
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
                className="w-full px-3 py-2 bg-brand-graphite-light border border-brand-ash rounded text-brand-white"
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
                rows={2}
                className="w-full px-3 py-2 bg-brand-graphite-light border border-brand-ash rounded text-brand-white placeholder:text-brand-silver resize-none"
                placeholder="Add any special notes..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-brand-ash">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-brand-ash rounded text-brand-smoke hover:text-brand-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
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

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={handleDateSelect}
        selectedDate={scheduledDate ? new Date(scheduledDate) : undefined}
      />
    </>
  );
}
