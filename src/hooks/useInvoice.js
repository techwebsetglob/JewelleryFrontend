import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { buildInvoiceData } from '../utils/invoiceHelpers';
import InvoiceDocument from '../components/invoice/InvoiceDocument';
import { createElement } from 'react';

export const useInvoice = () => {
  const [generating, setGenerating] = useState(false);

  const downloadInvoice = async (order) => {
    setGenerating(true);
    try {
      const data = buildInvoiceData(order);
      const blob = await pdf(createElement(InvoiceDocument, { data })).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AURUM-Invoice-${order.orderId || order.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  };

  const getInvoiceBlob = async (order) => {
    const data = buildInvoiceData(order);
    return await pdf(createElement(InvoiceDocument, { data })).toBlob();
  };

  return { downloadInvoice, getInvoiceBlob, generating };
};
