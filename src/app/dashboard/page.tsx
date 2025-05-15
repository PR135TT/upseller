// src/app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import UpsellForm from '../components/UpsellForm';
import UpsellPreview from '../components/UpsellPreview';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop');
  const router = useRouter();

  // form state
  const [formData, setFormData] = useState({
    triggerProduct: '',
    upsellProduct: '',
    message: '',
    discount: ''
  });

  // If no shop in URL, show the install button
  if (!shop) {
    // You could also add an <input> here to let them enter their .myshopify.com domain
    const defaultShop = 'your-dev-store.myshopify.com';
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <button
          onClick={() => router.push(`/api/auth?shop=${defaultShop}`)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Install on Shopify
        </button>
      </div>
    );
  }

  // Once shop is present, show the upsell form + preview
  return (
    <div className="p-6 grid md:grid-cols-2 gap-6 min-h-screen bg-gray-100">
      <UpsellForm formData={formData} setFormData={setFormData} />
      <UpsellPreview formData={formData} />
    </div>
  );
}
