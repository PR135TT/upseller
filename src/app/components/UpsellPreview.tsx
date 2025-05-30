// src/components/UpsellPreview.tsx
'use client';

import React from 'react';

interface PreviewProps {
  formData: {
    triggerProduct: string;
    upsellProduct:   string;
    message:         string;
    discount:        string;
  };
}

export default function UpsellPreview({ formData }: PreviewProps) {
  const { triggerProduct, upsellProduct, message, discount } = formData;

  // Don’t render until we have the essentials
  if (!triggerProduct || !upsellProduct || !message || !discount) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Fill out the form to preview your upsell</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Upsell Preview</h2>
      <div className="flex-1 flex flex-col justify-between">
        {/* Trigger Product */}
        <div className="mb-4">
          <p className="text-sm text-black-600">When a customer buys:</p>
          <div className="mt-2 p-4 bg-gray-50 rounded border border-gray-200">
            <p className="font-medium">{triggerProduct}</p>
          </div>
        </div>

        {/* Upsell Card */}
        <div className="mb-4">
          <p className="text-sm text-black-600">Offer this upsell:</p>
          <div className="mt-2 p-4 bg-gray-50 rounded border border-gray-200 flex items-center space-x-4">
            {/* Placeholder image */}
            <div className="w-16 h-16 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <p className="font-medium">{upsellProduct}</p>
              <p className="text-sm text-green-600">{discount}% OFF</p>
            </div>
          </div>
        </div>

        {/* Message and Button */}
        <div>
          <p className="mb-2 text-gray-700 italic">{message}&quot;</p>
          <button
            className="w-full bg-indigo-600 text-black py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Add Upsell to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
