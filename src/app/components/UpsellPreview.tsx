// src/components/UpsellPreview.tsx

type Props = {
  formData: {
    triggerProduct: string;
    upsellProduct: string;
    message: string;
    discount: string;
  };
};

export default function UpsellPreview({ formData }: Props) {
  return (
    <div className="bg-black p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Preview</h2>
      <div className="border p-4 bg-gray-50">
        <p><strong>Trigger:</strong> {formData.triggerProduct || '—'}</p>
        <p><strong>Upsell:</strong> {formData.upsellProduct || '—'}</p>
        <p><strong>Message:</strong> {formData.message || '—'}</p>
        <p><strong>Discount:</strong> {formData.discount ? `${formData.discount}%` : '—'}</p>
      </div>
    </div>
  );
}
