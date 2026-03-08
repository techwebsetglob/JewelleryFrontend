import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { pdf } from '@react-pdf/renderer';
import { buildInvoiceData } from '../../utils/invoiceHelpers';
import InvoiceDocument from './InvoiceDocument';
import { X, Download, Loader2 } from 'lucide-react';

/**
 * Full-screen modal that renders a live PDF preview via a blob URL iframe.
 * Uses pdf().toBlob() approach instead of PDFViewer, which is more reliable in Vite/browser environments.
 */
export default function InvoicePreviewModal({ order, onClose }) {
  const data = buildInvoiceData(order);
  const filename = `AURUM-Invoice-${order.orderId || order.id}.pdf`;

  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let objectUrl = null;
    setLoading(true);
    setError(null);

    pdf(<InvoiceDocument data={data} />)
      .toBlob()
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch((err) => {
        console.error('PDF generation error:', err);
        setError('Failed to generate PDF preview.');
      })
      .finally(() => setLoading(false));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.orderId || order.id]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-4xl h-[90vh] mx-4 rounded-2xl overflow-hidden border border-[#D4AF7F]/20 flex flex-col"
        style={{ background: 'rgba(8,8,8,0.97)' }}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF7F]/20 shrink-0">
          <div>
            <h2 className="font-serif text-xl text-[#D4AF7F]">Invoice Preview</h2>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-0.5">
              {data.invoice.number}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={loading || !!error}
              className="flex items-center gap-2 px-4 py-2 bg-[#D4AF7F] text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#c49b6b] transition-all disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 size={13} className="animate-spin" /> Generating…</>
              ) : (
                <><Download size={13} /> Download PDF</>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── PDF Viewer (iframe with blob URL) ── */}
        <div className="flex-1 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Loader2 size={36} className="animate-spin text-[#D4AF7F]" />
              <p className="text-[#D4AF7F]/60 text-xs uppercase tracking-widest">Generating invoice…</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {blobUrl && !loading && (
            <iframe
              src={blobUrl}
              title="Invoice Preview"
              width="100%"
              height="100%"
              style={{ border: 'none', background: '#fff' }}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

