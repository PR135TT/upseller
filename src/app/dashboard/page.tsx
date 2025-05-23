// src/app/dashboard/page.tsx
'use client';

import Spinner from '../components/Spinner';
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

  // saved rules state & loading
  const [savedRules, setSavedRules] = useState<RuleType[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);

  // banner notifications
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 1️⃣ Define a reload function
  const reloadRules = useCallback(() => {
    if (!shop) return;
    setLoadingRules(true);
    fetch(`/api/rules?shop=${shop}`)
      .then(res => res.json())
      .then((json: { success: boolean; data?: RuleType[]; error?: string }) => {
        if (json.success) {
          setSavedRules(json.data!);
        } else {
          console.error('Failed to load rules:', json.error);
          setSavedRules([]);
          setBanner({ type: 'error', message: `Failed to load rules: ${json.error}` });
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setSavedRules([]);
        setBanner({ type: 'error', message: 'Error fetching rules' });
      })
      .finally(() => {
        setLoadingRules(false);
      });
  }, [shop]);

  // 2️⃣ Initial load on mount / shop change
  useEffect(() => {
    reloadRules();
  }, [reloadRules]);

  // 3️⃣ Banner auto-dismiss after 3s
  useEffect(() => {
    if (!banner) return;
    const id = setTimeout(() => setBanner(null), 3000);
    return () => clearTimeout(id);
  }, [banner]);

  // If no shop in URL, show the install button
  if (!shop) {
    const defaultShop = 'your-dev-store.myshopify.com';
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <button
          onClick={() => router.push(`/api/auth?shop=${defaultShop}`)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Install on Shopify
        </button>
      </div>
    );
  }

  return (
    <div className="relative p-6 min-h-screen bg-gray-50">
      {/* Banner Notifications */}
      {banner && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-md ${
            banner.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {banner.message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form Card */}
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <UpsellForm
            formData={formData}
            setFormData={setFormData}
            onSave={() => {
              reloadRules();
              setBanner({ type: 'success', message: 'Upsell rule saved!' });
            }}
            onError={(msg) => setBanner({ type: 'error', message: msg })}
          />
        </div>

        {/* Preview Card */}
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <UpsellPreview formData={formData} />
        </div>

        {/* Existing rules list */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-bold mb-4">Existing Upsell Rules</h3>

          {loadingRules ? (
            <Spinner />
          ) : savedRules.length === 0 ? (
            <p className="text-sm text-gray-500">No rules yet.</p>
          ) : (
            <ul className="space-y-3">
              {savedRules.map(r => (
                <li key={r.id} className="flex justify-between items-center">
                  <span className="text-gray-700">
                    If <strong>{r.trigger_product_id}</strong> then upsell{' '}
                    <strong>{r.upsell_product_id}</strong> at {r.discount_percent}% off
                  </span>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this rule?')) return;
                      const res = await fetch(`/api/rules?id=${r.id}&shop=${shop}`, {
                        method: 'DELETE',
                      });
                      const json = await res.json();
                      if (json.success) {
                        reloadRules();
                        setBanner({ type: 'success', message: 'Upsell rule deleted.' });
                      } else {
                        setBanner({ type: 'error', message: 'Delete failed: ' + json.error });
                      }
                    }}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
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
