// src/components/NLUpsellForm.tsx
console.log("Rendering NLUpsellForm");
'use client';

import { useState } from 'react';

type Props = {
  onParsed: (data: {
    trigger_product_id: string;
    upsell_product_id:  string;
    message:            string;
    discount_percent:   number;
  }) => void;
  onError?: (msg: string) => void;
};

export default function NLUpsellForm({ onParsed, onError }: Props) {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/parse-rule', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ command }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Parse failed');
      }
      onParsed(json.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
      <label className="block mb-2 font-medium text-gray-700">
        Describe your upsell in plain English
      </label>
      <textarea
        value={command}
        onChange={e => setCommand(e.target.value)}
        placeholder="e.g. Create an upsell for product 12345 at 20% off when product 67890 is added to cart"
        rows={4}
        className="w-full p-2 border rounded mb-4 focus:ring-indigo-500 focus:border-indigo-500"
      />
      <button
        type="submit"
        disabled={loading || !command.trim()}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Parsing…' : 'Parse & Create Upsell'}
      </button>
    </form>
  );
}


