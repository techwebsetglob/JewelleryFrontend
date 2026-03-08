import React from 'react';
import { useOrderTracking } from '../hooks/useOrderTracking';
import TrackingTimeline from './TrackingTimeline';
import OrderTrackingSummary from './OrderTrackingSummary';
import TrackingStatusBadge from './TrackingStatusBadge';

const OrderTracker = ({ orderId, isAdmin = false }) => {
  const { order, trackingHistory, currentStatus, loading, error } = useOrderTracking(orderId, isAdmin);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        <p className="text-xs uppercase tracking-widest text-primary/60">Loading tracking information...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="glass-card-premium border border-red-500/20 rounded-2xl p-10 text-center">
        <span className="material-symbols-outlined text-4xl text-red-400 mb-4 block">error_outline</span>
        <p className="text-red-300 text-sm">{error || 'Order not found.'}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Status headline */}
      <div className="flex items-center gap-4 mb-8">
        <TrackingStatusBadge status={currentStatus} className="text-sm px-4 py-1.5" />
      </div>

      {/* Main 2-column layout */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
        {/* Timeline — left */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[10px] uppercase tracking-widest text-primary/60 mb-6">Shipment Progress</h3>
          <TrackingTimeline trackingHistory={trackingHistory} currentStatus={currentStatus} />
        </div>

        {/* Summary card — right */}
        <div className="w-full lg:w-[340px] shrink-0">
          <h3 className="text-[10px] uppercase tracking-widest text-primary/60 mb-6">Order Details</h3>
          <OrderTrackingSummary order={order} />
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;
