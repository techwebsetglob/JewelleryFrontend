import { format } from 'date-fns';

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return format(date, 'MMMM dd, yyyy');
};

export const formatInvoiceNumber = (orderId) => `INV-${orderId}`;

/**
 * Build a complete, normalised invoice data object from a Firestore order document.
 * Handles the naming inconsistencies between checkout (shippingCost/taxAmount)
 * and what the invoice expects.
 */
export const buildInvoiceData = (order) => {
  const shipping = order.shippingCost ?? order.shipping ?? 0;
  const tax = order.taxAmount ?? order.tax ?? 0;
  const subtotal = order.subtotal ?? order.total ?? 0;

  const addr = order.shippingAddress || {};
  const addressParts = [
    addr.address || addr.line1,
    addr.city,
    addr.state,
    addr.country,
    addr.postalCode || addr.zip,
  ].filter(Boolean);

  return {
    company: {
      name: 'AURUM',
      tagline: 'Luxury Jewelry Since 2024',
      email: 'orders@aurum-jewelry.com',
      phone: '+1 (800) AURUM-00',
      address: '24 Golden Avenue, New York, NY 10001',
      website: 'www.aurum-jewelry.com',
    },
    invoice: {
      number: formatInvoiceNumber(order.orderId || order.id),
      orderId: order.orderId || order.id,
      issuedDate: formatDate(order.createdAt),
      status: 'PAID',
    },
    customer: {
      name: order.userName || `${addr.firstName || ''} ${addr.lastName || ''}`.trim() || order.userEmail,
      email: order.userEmail || '',
      phone: addr.phone || '',
      address: addressParts.join(', '),
    },
    items: (order.items || []).map((item) => ({
      name: item.name,
      description: item.material || item.category || '',
      quantity: item.qty,
      unitPrice: item.price,
      total: item.price * item.qty,
    })),
    totals: {
      subtotal,
      discount: order.discountAmount || 0,
      promoCode: order.promoCode || null,
      shipping,
      tax,
      total: order.total ?? 0,
    },
  };
};
