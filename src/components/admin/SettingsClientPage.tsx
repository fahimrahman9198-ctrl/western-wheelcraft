'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CompanySettingsForm } from './CompanySettingsForm';

interface SettingsClientPageProps {
  initialData?: any;
}

export function SettingsClientPage({ initialData }: SettingsClientPageProps) {
  const [settings, setSettings] = useState(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    if (!initialData) {
      // Fetch existing settings
      const fetchSettings = async () => {
        try {
          const response = await fetch('/api/admin/settings');
          if (response.ok) {
            const data = await response.json();
            setSettings(data);
          } else {
            setSettings(null);
          }
        } catch (error) {
          console.error('Failed to fetch settings:', error);
          setSettings(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSettings();
    }
  }, [initialData]);

  const handleSubmit = async (data: any) => {
    try {
      const formData = new FormData();

      // Append form fields
      formData.append('name', data.name);
      formData.append('address', data.address);
      formData.append('phone', data.phone);
      formData.append('email', data.email);
      formData.append('taxId', data.taxId || '');
      formData.append('invoiceTerms', data.invoiceTerms || '');
      formData.append('bankDetails', data.bankDetails || '');

      // Append logo file if provided
      if (data.logo) {
        formData.append('logo', data.logo);
      }

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      const result = await response.json();
      setSettings(result);
      toast.success('Company settings saved successfully');
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-brand-smoke">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-display-sm text-brand-white">Company Settings</h1>
        <p className="mt-1 text-body-sm text-brand-silver">
          Configure company information, logo, and invoice details. Used across invoices, quotes, and email templates.
        </p>
      </div>

      <div className="rounded-xl border border-brand-graphite bg-brand-jet-light p-6">
        <CompanySettingsForm
          initialData={settings}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
