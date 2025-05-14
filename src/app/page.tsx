// src/app/page.tsx

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black-100">
      <h1 className="text-4xl font-bold mb-8">
        Welcome to One-Click Upsell Generator
      </h1>
      <div className="space-x-4">
        <Link href="/connect" className="px-4 py-2 bg-blue-500 text-white rounded">
         Connect Store
        </Link>
        <Link href="/dashboard" className="px-4 py-2 bg-green-500 text-white rounded">
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
