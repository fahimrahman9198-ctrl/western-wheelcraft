'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Trash2, Edit2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CustomerForm } from './CustomerForm';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  type: 'individual' | 'trade';
  companyName?: string;
  marketingConsent: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomersClientPageProps {
  customers: Customer[];
}

type ModalMode = null | 'create' | 'edit';

export function CustomersClientPage({ customers: initialCustomers }: CustomersClientPageProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreateModal = () => {
    setSelectedCustomer(null);
    setModalMode('create');
  };

  const handleOpenEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode('edit');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedCustomer(null);
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const url = '/api/admin/customers';
      const method = selectedCustomer ? 'PATCH' : 'POST';
      const body = selectedCustomer
        ? { ...data, customerId: selectedCustomer.id }
        : data;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save customer');
      }

      const result = await response.json();

      if (selectedCustomer) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === selectedCustomer.id ? result : c))
        );
      } else {
        setCustomers((prev) => [result, ...prev]);
      }

      handleCloseModal();
      window.location.reload();
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Are you sure you want to archive ${customer.name}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/customers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: customer.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete customer');
      }

      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      toast.success('Customer archived');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to archive customer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-display-sm text-brand-white">Customers</h1>
          <p className="mt-1 text-body-sm text-brand-smoke">
            Create, edit, and manage customer records. Manual entry for trade/business accounts.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-red hover:bg-brand-red-hover rounded-lg text-white font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Customer
        </button>
      </div>

      {/* Customers Grid */}
      {customers.length === 0 ? (
        <div className="rounded-xl border border-brand-ash bg-brand-graphite px-6 py-16 text-center">
          <Mail className="mx-auto text-brand-silver" size={36} />
          <h2 className="mt-4 font-display text-body-lg text-brand-white">No customers yet</h2>
          <p className="mx-auto mt-2 max-w-md text-body-sm text-brand-smoke">
            Customers appear here after contact form submissions or manual creation.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-xl border border-brand-ash bg-brand-graphite p-5 hover:border-brand-red/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-display text-body-lg text-brand-white">{customer.name}</h3>
                  <p className="text-caption text-brand-smoke mt-1">
                    {customer.type === 'trade' ? 'Trade/Business' : 'Individual'}
                    {customer.companyName && ` • ${customer.companyName}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEditModal(customer)}
                    className="p-2 hover:bg-brand-graphite-light rounded transition-colors text-brand-smoke hover:text-brand-white"
                    title="Edit customer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer)}
                    className="p-2 hover:bg-red-500/20 rounded transition-colors text-brand-smoke hover:text-red-400"
                    title="Archive customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="flex items-center gap-2 text-body-sm text-brand-smoke hover:text-brand-red transition-colors"
                  >
                    <Mail size={14} className="text-brand-red" />
                    <span className="truncate">{customer.email}</span>
                  </a>
                )}
                {customer.phone && (
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex items-center gap-2 text-body-sm text-brand-smoke hover:text-brand-red transition-colors"
                  >
                    <Phone size={14} className="text-brand-red" />
                    <span>{customer.phone}</span>
                  </a>
                )}
                {customer.city && (
                  <div className="flex items-center gap-2 text-body-sm text-brand-smoke">
                    <MapPin size={14} className="text-brand-red" />
                    <span>
                      {customer.city}
                      {customer.province && `, ${customer.province}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-brand-graphite-light/30 rounded-lg mb-3 text-center">
                <div>
                  <p className="text-brand-white font-mono font-bold">0</p>
                  <p className="text-caption text-brand-smoke">Quotes</p>
                </div>
                <div>
                  <p className="text-brand-white font-mono font-bold">0</p>
                  <p className="text-caption text-brand-smoke">Bookings</p>
                </div>
                <div>
                  <p className="text-brand-white font-mono font-bold">0</p>
                  <p className="text-caption text-brand-smoke">Invoices</p>
                </div>
              </div>

              {/* Notes */}
              {customer.notes && (
                <p className="text-body-xs text-brand-smoke line-clamp-2 border-t border-brand-ash pt-3">
                  {customer.notes}
                </p>
              )}

              {/* Marketing Status */}
              {customer.marketingConsent && (
                <p className="text-caption text-green-400 mt-2">✓ Opted in to marketing</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-brand-jet rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-brand-ash">
            <div className="sticky top-0 border-b border-brand-ash bg-brand-graphite p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-brand-white">
                {modalMode === 'create' ? 'Create Customer' : 'Edit Customer'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-brand-smoke hover:text-brand-white"
              >
                ✕
              </button>
            </div>
            <CustomerForm
              initialData={selectedCustomer}
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}
