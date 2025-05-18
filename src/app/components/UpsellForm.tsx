// src/components/UpsellForm.tsx
'use client';

import { ChangeEvent, useState } from 'react';

interface FormData {
  triggerProduct: string;
  upsellProduct:   string;
  message:         string;
  discount:        string;
}

interface ApiResponse {
  success?: boolean;
  error?:   string;
}

type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSave?:   () => void;              // called on success
  onError?:  (msg: string) => void;   // called on error
};

export default function UpsellForm({ formData, setFormData, onSave, onError }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Check all fields are non-empty
  const canSave =
    formData.triggerProduct.trim() !== '' &&
    formData.upsellProduct.trim()   !== '' &&
    formData.message.trim()         !== '' &&
    formData.discount.trim()        !== '';

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const shop = new URLSearchParams(window.location.search).get('shop');
    if (!shop) {
      const msg = 'Shop parameter missing';
      setError(msg);
      onError?.(msg);
      setLoading(false);
      return;
    }

    const payload = {
      shop,
      trigger_product_id: formData.triggerProduct,
      upsell_product_id:  formData.upsellProduct,
      message:            formData.message,
      discount_percent:   Number(formData.discount),
    };

    console.log('🚀 Saving payload:', payload);

    try {
      const res = await fetch('/api/rules', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const text = await res.text();
      let data: ApiResponse;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Invalid JSON response');
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save rule');
      }

      // Success: clear form & notify
      setFormData({ triggerProduct: '', upsellProduct: '', message: '', discount: '' });
      onSave?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Create Upsell Offer</h2>
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={e => { e.preventDefault(); handleSave(); }}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Product</label>
          <input
            name="triggerProduct"
            value={formData.triggerProduct}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upsell Product</label>
          <input
            name="upsellProduct"
            value={formData.upsellProduct}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <input
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
          <input
            name="discount"
            type="number"
            value={formData.discount}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading || !canSave}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save Upsell Rule'}
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      </form>
    </div>
  );
}
