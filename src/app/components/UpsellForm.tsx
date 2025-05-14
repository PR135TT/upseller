// src/components/UpsellForm.tsx
'use client';

import { ChangeEvent } from 'react';

interface FormData {
  triggerProduct: string;
  upsellProduct:   string;
  message:         string;
  discount:        string;
}


type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
};

export default function UpsellForm({ formData, setFormData }: Props) {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Create Upsell Offer</h2>
      <form className="space-y-4">
        <div>
          <label className="block mb-1">Trigger Product</label>
          <input
            name="triggerProduct"
            value={formData.triggerProduct}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Upsell Product</label>
          <input
            name="upsellProduct"
            value={formData.upsellProduct}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Message</label>
          <input
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Discount (%)</label>
          <input
            name="discount"
            type="number"
            value={formData.discount}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </form>
    </div>
  );
}
