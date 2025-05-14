// src/app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import UpsellForm from '../components/UpsellForm';
import UpsellPreview from '../components/UpsellPreview';

export default function DashboardPage() {
  // formData holds the values from the form
  const [formData, setFormData] = useState({
    triggerProduct: '',
    upsellProduct: '',
    message: '',
    discount: ''
  });

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6 min-h-screen bg-gray-100">
      <UpsellForm formData={formData} setFormData={setFormData} />
      <UpsellPreview formData={formData} />
    </div>
  );
}
