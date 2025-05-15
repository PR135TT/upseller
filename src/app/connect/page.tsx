'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConnectPage() {
  const [shop, setShop] = useState('');
  const router = useRouter();

  const handleConnect = () => {
    if (!shop.endsWith('.myshopify.com')) {
      alert('Please enter a valid Shopify domain like yourstore.myshopify.com');
      return;
    }

    // Redirect to your OAuth handler
    router.push(`/api/auth?shop=${shop}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Connect Your Shopify Store</h1>
        <input
          type="text"
          placeholder="yourstore.myshopify.com"
          className="w-full p-2 border rounded mb-4"
          value={shop}
          onChange={(e) => setShop(e.target.value)}
        />
        <button
          onClick={handleConnect}
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Connect Store
        </button>
      </div>
    </div>
  );
}
