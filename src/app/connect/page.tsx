// src/app/connect/page.tsx
'use client';

export default function ConnectPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Connect Your Shopify Store</h1>
        <button
          onClick={() => alert('Shopify OAuth not wired yet')}
          className="px-6 py-3 bg-green-500 rounded-lg hover:bg-green-600"
        >
          Connect Store
        </button>
      </div>
    </div>
  );
}
