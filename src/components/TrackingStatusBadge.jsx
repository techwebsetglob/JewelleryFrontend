import React from 'react';

const STATUS_LABELS = {
  order_placed: 'Order Placed',
  payment_confirmed: 'Payment Confirmed',
  preparing: 'Preparing',
  quality_check: 'Quality Check',
  packaged: 'Packaged',
  dispatched: 'Dispatched',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  delivery_attempted: 'Delivery Attempted',
  on_hold: 'On Hold',
  returned: 'Returned',
};

const STATUS_COLORS = {
  order_placed: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  payment_confirmed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  preparing: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  quality_check: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  packaged: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  dispatched: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  in_transit: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  out_for_delivery: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
  delivered: 'bg-green-500/20 text-green-300 border-green-500/30',
  delivery_attempted: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  on_hold: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  returned: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const TrackingStatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const colorClass = STATUS_COLORS[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  const label = STATUS_LABELS[status] || status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
};

export default TrackingStatusBadge;
