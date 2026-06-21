'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const CustomerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(160),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().max(40).optional().or(z.literal('')).nullable(),
  address: z.string().max(500).optional().or(z.literal('')).nullable(),
  city: z.string().max(120).optional().or(z.literal('')).nullable(),
  province: z.string().max(50).optional().or(z.literal('')).nullable(),
  postalCode: z.string().max(20).optional().or(z.literal('')).nullable(),
  type: z.enum(['individual', 'trade']),
  companyName: z.string().max(255).optional().or(z.literal('')).nullable(),
  marketingConsent: z.boolean(),
  notes: z.string().max(2000).optional().or(z.literal('')).nullable(),
});

type CustomerFormInput = z.infer<typeof CustomerFormSchema>;

interface CustomerFormProps {
  initialData?: any;
  onSubmit: (data: CustomerFormInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PROVINCES = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Nova Scotia',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
];

export function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CustomerFormInput>({
    resolver: zodResolver(CustomerFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      province: initialData?.province || '',
      postalCode: initialData?.postalCode || '',
      type: initialData?.type || 'individual',
      companyName: initialData?.companyName || '',
      marketingConsent: initialData?.marketingConsent || false,
      notes: initialData?.notes || '',
    },
  });

  const customerType = watch('type');

  const handleFormSubmit = async (data: CustomerFormInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success(initialData ? 'Customer updated successfully' : 'Customer created successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-1">
          Full Name *
        </label>
        <input
          type="text"
          {...register('name')}
          className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash"
          placeholder="John Smith"
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-1">
          Email *
        </label>
        <input
          type="email"
          {...register('email')}
          className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash"
          placeholder="john@example.com"
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-1">
          Phone
        </label>
        <input
          type="tel"
          {...register('phone')}
          className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash"
          placeholder="(604) 555-0001"
        />
        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-1">
          Address
        </label>
        <input
          type="text"
          {...register('address')}
          className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash"
          placeholder="123 Main St"
        />
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-1">
          City
        </label>
        <input
          type="text"
          {...register('city')}
          className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash"
          placeholder="Vancouver"
        />
      </div>

      {/* Province */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-1">
          Province
        </label>
        <select
          {...register('province')}
          className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white"
        >
          <option value="">Select province...</option>
          {PROVINCES.map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>
      </div>

      {/* Postal Code */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-1">
          Postal Code
        </label>
        <input
          type="text"
          {...register('postalCode')}
          className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash"
          placeholder="V6B 1A1"
        />
      </div>

      {/* Customer Type */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-2">
          Customer Type *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="individual"
              {...register('type')}
              className="w-4 h-4"
            />
            <span className="text-brand-white text-sm">Individual</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="trade"
              {...register('type')}
              className="w-4 h-4"
            />
            <span className="text-brand-white text-sm">Trade/Business</span>
          </label>
        </div>
      </div>

      {/* Company Name (show if trade) */}
      {customerType === 'trade' && (
        <div>
          <label className="block text-sm font-medium text-brand-white mb-1">
            Company Name *
          </label>
          <input
            type="text"
            {...register('companyName')}
            className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash"
            placeholder="ABC Auto Repair"
          />
          {errors.companyName && (
            <p className="text-red-400 text-xs mt-1">{errors.companyName.message}</p>
          )}
        </div>
      )}

      {/* Marketing Consent */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('marketingConsent')}
            className="w-4 h-4"
          />
          <span className="text-brand-white text-sm">
            Allow marketing communications
          </span>
        </label>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-1">
          Internal Notes
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash resize-none"
          placeholder="Add any internal notes about this customer..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-brand-graphite">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-brand-graphite rounded text-brand-smoke hover:text-brand-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="flex-1 px-4 py-2 bg-brand-red rounded text-white font-medium hover:bg-brand-red-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Customer' : 'Create Customer'
          )}
        </button>
      </div>
    </form>
  );
}
