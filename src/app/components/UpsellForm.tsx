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
  error?: string;
}

type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
};

export default function UpsellForm({ formData, setFormData }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(window.location.search);
      const shop = params.get('shop');
      if (!shop) throw new Error('Shop parameter missing');

      const payload = {
        shop,
        trigger_product_id: formData.triggerProduct,
        upsell_product_id: formData.upsellProduct,
        message: formData.message,
        discount_percent: Number(formData.discount),
      };

      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log('❗ Raw response text:', text);

      let data: ApiResponse;
      try {
        data = JSON.parse(text) as ApiResponse;
      } catch {
        data = { error: 'Invalid JSON response' };
      }

      if (!res.ok || data.error) {
        const msg = data.error || 'Failed to save rule';
        throw new Error(msg);
      }

      alert('Rule saved successfully!');
      setFormData({ triggerProduct: '', upsellProduct: '', message: '', discount: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-white">Create Upsell Offer</h2>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div>
          <label className="block mb-1 text-white">Trigger Product</label>
          <input
            name="triggerProduct"
            value={formData.triggerProduct}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 text-white">Upsell Product</label>
          <input
            name="upsellProduct"
            value={formData.upsellProduct}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 text-white">Message</label>
          <input
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 text-white">Discount (%)</label>
          <input
            name="discount"
            type="number"
            value={formData.discount}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Upsell Rule'}
        </button>
        {error && <p className="mt-2 text-red-500">{error}</p>}
      </form>
    </div>
  );
}
