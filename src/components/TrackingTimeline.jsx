import React from 'react';
import {
  ShoppingBag,
  CreditCard,
  Package,
  ShieldCheck,
  Gift,
  Truck,
  MapPin,
  Navigation,
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { STATUS_PROGRESSION } from '../hooks/useOrderTracking';

const STATUS_CONFIG = {
  order_placed:       { label: 'Order Placed',           icon: ShoppingBag,  color: 'gold' },
  payment_confirmed:  { label: 'Payment Confirmed',      icon: CreditCard,   color: 'gold' },
  preparing:          { label: 'Preparing Your Order',   icon: Package,      color: 'gold' },
  quality_check:      { label: 'Quality Inspection',     icon: ShieldCheck,  color: 'gold' },
  packaged:           { label: 'Beautifully Packaged',   icon: Gift,         color: 'gold' },
  dispatched:         { label: 'Dispatched',             icon: Truck,        color: 'gold' },
  in_transit:         { label: 'In Transit',             icon: MapPin,       color: 'gold' },
  out_for_delivery:   { label: 'Out for Delivery',       icon: Navigation,   color: 'gold' },
  delivered:          { label: 'Delivered',              icon: CheckCircle,  color: 'green' },
  delivery_attempted: { label: 'Delivery Attempted',     icon: AlertCircle,  color: 'amber' },
  on_hold:            { label: 'On Hold',                icon: Clock,        color: 'amber' },
  returned:           { label: 'Returned',               icon: RotateCcw,    color: 'red' },
};

const colorMap = {
  gold: {
    filled:  'bg-primary border-primary text-black shadow-[0_0_10px_rgba(212,175,127,0.6)]',
    pulse:   'bg-primary border-primary shadow-[0_0_14px_rgba(212,175,127,0.8)]',
    line:    'bg-primary',
    text:    'text-white',
    subtext: 'text-primary/70',
    icon:    'text-black',
  },
  green: {
    filled:  'bg-green-500 border-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]',
    pulse:   'bg-green-500 border-green-500',
    line:    'bg-green-500',
    text:    'text-white',
    subtext: 'text-green-300/70',
    icon:    'text-white',
  },
  amber: {
    filled:  'bg-amber-500 border-amber-500 text-white',
    pulse:   'bg-amber-500 border-amber-500',
    line:    'bg-amber-500',
    text:    'text-white',
    subtext: 'text-amber-300/70',
    icon:    'text-white',
  },
  red: {
    filled:  'bg-red-500 border-red-500 text-white',
    pulse:   'bg-red-500 border-red-500',
    line:    'bg-red-500',
    text:    'text-white',
    subtext: 'text-red-300/70',
    icon:    'text-white',
  },
};

const formatEventTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const TrackingTimeline = ({ trackingHistory = [], currentStatus }) => {
  // Build a map of status → last event data for lookup
  const eventMap = {};
  trackingHistory.forEach((ev) => {
    eventMap[ev.status] = ev; // last event wins per status key
  });

  const currentMainIdx = STATUS_PROGRESSION.indexOf(currentStatus);

  // Detect side-branch events present in history
  const sideBranchEvents = trackingHistory.filter((ev) =>
    ['delivery_attempted', 'on_hold', 'returned'].includes(ev.status)
  );

  return (
    <div className="flex flex-col">
      {/* Main progression */}
      {STATUS_PROGRESSION.map((status, idx) => {
        const config = STATUS_CONFIG[status];
        const Icon = config.icon;
        const color = colorMap[config.color];

        const isCompleted = currentMainIdx > idx;
        const isCurrent = currentMainIdx === idx;
        const isUpcoming = currentMainIdx < idx;

        const event = eventMap[status];
        const isLast = idx === STATUS_PROGRESSION.length - 1;

        return (
          <div key={status} className="flex gap-4 relative">
            {/* Icon column */}
            <div className="flex flex-col items-center shrink-0">
              {/* Circle */}
              <div
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center z-10 relative transition-all duration-500 ${
                  isCompleted
                    ? color.filled
                    : isCurrent
                    ? `${color.pulse} animate-pulse`
                    : 'bg-white/5 border-white/15'
                }`}
              >
                <Icon
                  size={16}
                  className={
                    isCompleted || isCurrent
                      ? color.icon
                      : 'text-white/25'
                  }
                />
              </div>
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[32px] mt-1 mb-1 transition-all duration-500 ${
                    isCompleted ? color.line : 'bg-white/10'
                  }`}
                />
              )}
            </div>

            {/* Content column */}
            <div className={`pb-6 pt-1.5 flex-1 min-w-0 ${isLast ? 'pb-0' : ''}`}>
              <p
                className={`text-[11px] font-bold uppercase tracking-widest mb-0.5 ${
                  isCompleted || isCurrent ? color.text : 'text-white/25'
                }`}
              >
                {config.label}
              </p>

              {(isCompleted || isCurrent) && event && (
                <>
                  <p className={`text-xs leading-relaxed ${color.subtext}`}>{event.message}</p>
                  {event.location && (
                    <p className="text-[10px] text-primary/50 mt-1 flex items-center gap-1">
                      <MapPin size={10} />
                      {event.location}
                    </p>
                  )}
                  <p className="text-[10px] text-white/30 mt-1">
                    {formatEventTime(event.timestamp)}
                  </p>
                </>
              )}

              {isUpcoming && (
                <p className="text-[10px] text-white/20">Pending</p>
              )}
            </div>
          </div>
        );
      })}

      {/* Side-branch events (delivery_attempted, on_hold, returned) */}
      {sideBranchEvents.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-primary/40 mb-4">Additional Events</p>
          {sideBranchEvents.map((ev, i) => {
            const config = STATUS_CONFIG[ev.status] || { label: ev.status, icon: AlertCircle, color: 'amber' };
            const Icon = config.icon;
            const cKey = config.color || 'amber';
            const color = colorMap[cKey] || colorMap.amber;
            return (
              <div key={i} className="flex gap-4 mb-4">
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${color.filled}`}>
                    <Icon size={16} className={color.icon} />
                  </div>
                </div>
                <div className="pt-1.5">
                  <p className={`text-[11px] font-bold uppercase tracking-widest mb-0.5 ${color.text}`}>{config.label}</p>
                  <p className={`text-xs ${color.subtext}`}>{ev.message}</p>
                  {ev.location && (
                    <p className="text-[10px] text-white/40 mt-0.5 flex items-center gap-1">
                      <MapPin size={10} />{ev.location}
                    </p>
                  )}
                  <p className="text-[10px] text-white/30 mt-1">{formatEventTime(ev.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrackingTimeline;
