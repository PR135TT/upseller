'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import UpsellForm from '../components/UpsellForm';
import UpsellPreview from '../components/UpsellPreview';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shop = searchParams.get('shop');

  // form state
  const [formData, setFormData] = useState({
    triggerProduct: '',
    upsellProduct: '',
    message: '',
    discount: '',
  });

  // If no shop in URL, show the install button
  if (!shop) {
    const defaultShop = 'your-dev-store.myshopify.com';
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-100">
        <button
          onClick={() => router.push(`/api/auth?shop=${defaultShop}`)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Install on Shopify
        </button>
      </div>
    );
  }

  // Once shop is present, show the upsell form and preview
  return (
    <div className="p-6 grid md:grid-cols-2 gap-6 min-h-screen bg-black-100">
      <UpsellForm formData={formData} setFormData={setFormData} />
      <UpsellPreview formData={formData} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>loadConfig...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
