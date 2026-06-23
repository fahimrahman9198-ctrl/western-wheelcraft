'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const CompanySettingsSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(255),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500),
  phone: z.string().min(10, 'Phone must be at least 10 characters').max(40),
  email: z.string().email('Invalid email address').max(255),
  taxId: z.string().max(50).optional().or(z.literal('')),
  invoiceTerms: z.string().max(2000).optional().or(z.literal('')),
  bankDetails: z.string().max(500).optional().or(z.literal('')),
});

type CompanySettingsInput = z.infer<typeof CompanySettingsSchema>;

interface CompanySettingsFormProps {
  initialData?: any;
  onSubmit: (data: CompanySettingsInput & { logo?: File }) => Promise<void>;
  isLoading?: boolean;
}

export function CompanySettingsForm({
  initialData,
  onSubmit,
  isLoading,
}: CompanySettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoBlobUrl || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanySettingsInput>({
    resolver: zodResolver(CompanySettingsSchema),
    defaultValues: {
      name: initialData?.name || '',
      address: initialData?.address || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      taxId: initialData?.taxId || '',
      invoiceTerms: initialData?.invoiceTerms || '',
      bankDetails: initialData?.bankDetails || '',
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async (data: CompanySettingsInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        logo: logoFile || undefined,
      });
      toast.success('Company settings saved successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-3">
          Company Logo
        </label>
        <div className="flex flex-col gap-4">
          {logoPreview ? (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-brand-ash bg-brand-graphite/30">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-brand-ash bg-brand-graphite/10 flex items-center justify-center">
              <span className="text-brand-ash text-sm text-center">No logo</span>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-graphite hover:bg-brand-graphite/80 rounded text-brand-white transition-colors"
          >
            <Upload className="w-4 h-4" />
            {logoPreview ? 'Change Logo' : 'Upload Logo'}
          </button>
          <p className="text-xs text-brand-silver">
            PNG or JPG, max 5MB. Used on invoices and email templates.
          </p>
        </div>
      </div>

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-1">
          Company Name *
        </label>
        <input
          type="text"
          {...register('name')}
          className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash"
          placeholder="Western Wheelcraft"
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-1">
          Email Address *
        </label>
        <input
          type="email"
          {...register('email')}
          className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash"
          placeholder="info@company.ca"
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-1">
          Phone Number *
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
          Business Address *
        </label>
        <textarea
          {...register('address')}
          rows={3}
          className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash resize-none"
          placeholder="123 Business St, Vancouver, BC V6B 1A1"
        />
        {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
      </div>

      {/* Tax ID */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-1">
          Tax ID / GST Number
        </label>
        <input
          type="text"
          {...register('taxId')}
          className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash"
          placeholder="GST123456789"
        />
        <p className="text-xs text-brand-silver mt-1">
          Displayed on invoices (optional)
        </p>
      </div>

      {/* Invoice Terms */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-1">
          Invoice Terms & Conditions
        </label>
        <textarea
          {...register('invoiceTerms')}
          rows={4}
          className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash resize-none"
          placeholder="Payment is due within 30 days of invoice date..."
        />
        <p className="text-xs text-brand-silver mt-1">
          Displayed on invoices (optional)
        </p>
      </div>

      {/* Bank Details */}
      <div>
        <label className="block text-sm font-medium text-brand-white mb-1">
          Bank Account Details
        </label>
        <textarea
          {...register('bankDetails')}
          rows={3}
          className="w-full px-3 py-2 bg-brand-graphite border border-brand-graphite-light rounded text-brand-white placeholder:text-brand-ash resize-none"
          placeholder="Account Name: Western Wheelcraft Inc.&#10;Account Number: XXXX XXXX XXXX XXXX&#10;Routing Number: XXXXX"
        />
        <p className="text-xs text-brand-silver mt-1">
          For invoice footer and payment instructions (optional)
        </p>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-brand-graphite">
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full px-4 py-2 bg-brand-red rounded text-white font-medium hover:bg-brand-red-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Company Settings'
          )}
        </button>
      </div>
    </form>
  );
}
