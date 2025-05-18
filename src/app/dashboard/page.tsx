// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import UpsellForm from '../components/UpsellForm';
import UpsellPreview from '../components/UpsellPreview';

// Define the shape of a saved rule
interface RuleType {
  id: string;
  shop: string;
  trigger_product_id: string;
  upsell_product_id: string;
  message: string;
  discount_percent: number;
}

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

  // saved rules state
  const [savedRules, setSavedRules] = useState<RuleType[]>([]);

  // 1️⃣ Define a reload function
  const reloadRules = useCallback(() => {
    if (!shop) return;
    fetch(`/api/rules?shop=${shop}`)
      .then(res => res.json())
      .then((json: { success: boolean; data?: RuleType[]; error?: string }) => {
        if (json.success) {
          setSavedRules(json.data!);
        } else {
          console.error('Failed to load rules:', json.error);
          setSavedRules([]);  // clear on failure or keep previous
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setSavedRules([]);
      });
  }, [shop]);

  // 2️⃣ Initial load on mount / shop change
  useEffect(() => {
    reloadRules();
  }, [reloadRules]);

  // If no shop in URL, show the install button
  if (!shop) {
    const defaultShop = 'your-dev-store.myshopify.com';
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-100">
        <button
          onClick={() => router.push(`/api/auth?shop=${defaultShop}`)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Install on Shopify
        </button>
      </div>
    );
  }

  // Once shop is present, show the upsell form, preview, and saved rules
  return (
    <div className="p-6 grid md:grid-cols-2 gap-6 min-h-screen bg-gray-100">
      {/* 3️⃣ Pass reloadRules into the form */}
      <UpsellForm
        formData={formData}
        setFormData={setFormData}
        onSave={reloadRules}
      />
      <UpsellPreview formData={formData} />

      {/* Existing rules list */}
      <div className="md:col-span-2 bg-black p-4 rounded shadow">
        <h3 className="text-lg font-bold mb-2">Existing Upsell Rules</h3>
        {savedRules.length === 0 ? (
          <p className="text-sm text-black-500">No rules yet.</p>
        ) : (
          <ul className="list-disc ml-5 space-y-1">
            {savedRules.map(r => (
              <li key={r.id}>
                If product <strong>{r.trigger_product_id}</strong> then upsell{' '}
                <strong>{r.upsell_product_id}</strong> at {r.discount_percent}% off
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <span>Loading dashboard…</span>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
