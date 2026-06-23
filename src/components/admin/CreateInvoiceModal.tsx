'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const CreateInvoiceSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(10, 'Valid phone is required'),
  vehicleVIN: z.string().optional().or(z.literal('')),
  vehiclePlate: z.string().optional().or(z.literal('')),
  wheelsWorked: z.string().min(1, 'Number of wheels is required'),
  description: z.string().optional().or(z.literal('')),
  price: z.number().positive('Price must be greater than 0'),
  discount: z.number().min(0, 'Discount cannot be negative'),
});

type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GST_RATE = 0.05; // 5%
const PST_RATE = 0.07; // 7%

export function CreateInvoiceModal({ isOpen, onClose }: CreateInvoiceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateInvoiceInput>({
    resolver: zodResolver(CreateInvoiceSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      vehicleVIN: '',
      vehiclePlate: '',
      wheelsWorked: '4',
      description: '',
      price: 0,
      discount: 0 as any,
    } as any,
  });

  const price = watch('price') || 0;
  const discount = watch('discount') || 0;
  const priceAfterDiscount = Math.max(0, price - discount);
  const gst = priceAfterDiscount * GST_RATE;
  const pst = priceAfterDiscount * PST_RATE;
  const total = priceAfterDiscount + gst + pst;

  const handleFormSubmit = async (data: CreateInvoiceInput) => {
    setIsSubmitting(true);
    try {
      // Server is the source of truth for gst/pst/total — only send inputs.
      const response = await fetch('/api/admin/invoices/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          wheelsWorked: parseInt(data.wheelsWorked),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create invoice');
      }

      const result = await response.json();
      toast.success(`Invoice #${result.invoiceNumber} created successfully`);
      reset();
      onClose();
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-brand-jet rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-brand-graphite">
        {/* Header */}
        <div className="sticky top-0 border-b border-brand-graphite bg-brand-jet-light p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-brand-white">Create New Invoice</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-brand-graphite rounded transition-colors"
          >
            <X className="w-5 h-5 text-brand-smoke" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-white mb-4 pb-2 border-b border-brand-graphite">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-white mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  {...register('customerName')}
                  className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash"
                  placeholder="John Smith"
                />
                {errors.customerName && (
                  <p className="text-red-400 text-xs mt-1">{errors.customerName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-white mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('customerEmail')}
                  className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash"
                  placeholder="john@example.com"
                />
                {errors.customerEmail && (
                  <p className="text-red-400 text-xs mt-1">{errors.customerEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-white mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  {...register('customerPhone')}
                  className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash"
                  placeholder="(604) 555-0001"
                />
                {errors.customerPhone && (
                  <p className="text-red-400 text-xs mt-1">{errors.customerPhone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-white mb-4 pb-2 border-b border-brand-graphite">
              Vehicle Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-white mb-1">
                  VIN Number
                </label>
                <input
                  type="text"
                  {...register('vehicleVIN')}
                  className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash uppercase"
                  placeholder="1HGCM41JXMA109186"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-white mb-1">
                  License Plate / Stock #
                </label>
                <input
                  type="text"
                  {...register('vehiclePlate')}
                  className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash uppercase"
                  placeholder="ABC 123 or STOCK-456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-white mb-1">
                  Wheels Worked On *
                </label>
                <select
                  {...register('wheelsWorked')}
                  className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white"
                >
                  <option value="1">1 Wheel</option>
                  <option value="2">2 Wheels</option>
                  <option value="3">3 Wheels</option>
                  <option value="4">4 Wheels</option>
                </select>
                {errors.wheelsWorked && (
                  <p className="text-red-400 text-xs mt-1">{errors.wheelsWorked.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Service Description */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-white mb-4 pb-2 border-b border-brand-graphite">
              Service Details
            </h3>
            <div>
              <label className="block text-sm font-medium text-brand-white mb-1">
                Description (e.g., Wheel refinishing, Curb rash repair)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash resize-none"
                placeholder="Describe the service performed..."
              />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-white mb-4 pb-2 border-b border-brand-graphite">
              Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-white mb-1">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-brand-white">$</span>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    className="w-full px-3 py-2 pl-7 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash"
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-white mb-1">
                  Discount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-brand-white">$</span>
                  <input
                    type="number"
                    step="0.01"
                    {...register('discount', { valueAsNumber: true })}
                    className="w-full px-3 py-2 pl-7 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="bg-brand-graphite/30 p-4 rounded-lg border border-brand-graphite">
            <h3 className="text-sm font-semibold text-brand-white mb-3">Invoice Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-silver">Subtotal:</span>
                <span className="text-brand-white font-mono">${price.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Discount:</span>
                  <span className="font-mono">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-brand-graphite/50 pt-2">
                <span className="text-brand-silver">After Discount:</span>
                <span className="text-brand-white font-mono">${priceAfterDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-silver">GST (5%):</span>
                <span className="text-brand-white font-mono">${gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-silver">PST (7%):</span>
                <span className="text-brand-white font-mono">${pst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-brand-graphite pt-2 bg-brand-jet p-2 rounded">
                <span className="font-semibold text-brand-white">Total:</span>
                <span className="font-semibold text-brand-white font-mono text-lg">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-brand-red rounded text-white font-medium hover:bg-brand-red-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create & Generate PDF'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
