import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import InvoicePreviewModal from './InvoicePreviewModal';

/**
 * Reusable invoice download button.
 *
 * @param {object} order   - Firestore order document (must have orderId / id).
 * @param {'full'|'icon'} variant - 'full' shows "Download Invoice" label, 'icon' shows "Invoice".
 */
export default function InvoiceButton({ order, variant = 'full' }) {
  const [showModal, setShowModal] = useState(false);

  // Show the button for any non-cancelled order
  const canDownload = order?.status !== 'cancelled' && order?.currentStatus !== 'cancelled';
  if (!canDownload) return null;

  const label = variant === 'full' ? 'View Invoice' : 'Invoice';

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        title="View PDF Invoice"
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D4AF7F]/30 text-[#D4AF7F] hover:bg-[#D4AF7F]/10 transition-all text-xs uppercase tracking-widest font-bold"
      >
        <FileText size={13} />
        {label}
      </button>

      {showModal && (
        <InvoicePreviewModal
          order={order}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
