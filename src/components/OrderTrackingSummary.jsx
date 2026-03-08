import React from 'react';
import { ExternalLink, MapPin, Package, Calendar } from 'lucide-react';

const formatDate = (dateOrTimestamp) => {
  if (!dateOrTimestamp) return null;
  const date = dateOrTimestamp.toDate ? dateOrTimestamp.toDate() : new Date(dateOrTimestamp);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const isWithinTwoDays = (dateOrTimestamp) => {
  if (!dateOrTimestamp) return false;
  const date = dateOrTimestamp.toDate ? dateOrTimestamp.toDate() : new Date(dateOrTimestamp);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 2;
};

const maskAddress = (shippingAddress) => {
  if (!shippingAddress) return null;
  const { city, country, postalCode } = shippingAddress;
  return [city, country, postalCode].filter(Boolean).join(', ');
};

const OrderTrackingSummary = ({ order }) => {
  if (!order) return null;

  const {
    orderId,
    createdAt,
    items = [],
    total,
    carrier,
    trackingNumber,
    carrierTrackingUrl,
    estimatedDelivery,
    shippingAddress,
    userName,
  } = order;

  const displayedItems = items.slice(0, 2);
  const extraCount = items.length - 2;
  const isUrgent = isWithinTwoDays(estimatedDelivery);

  return (
    <div className="glass-card-premium border border-primary/20 rounded-2xl p-6 lg:p-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-primary/60 mb-1">Order Reference</p>
        <h3 className="font-serif text-xl text-primary">{orderId || `#${order.id?.slice(-6).toUpperCase()}`}</h3>
        {createdAt && (
          <p className="text-xs text-white/50 mt-1">
            Placed {formatDate(createdAt)}
          </p>
        )}
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary/60 mb-3">Items</p>
          <div className="flex flex-col gap-3">
            {displayedItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-14 object-cover rounded bg-white/5 border border-primary/10 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-14 rounded bg-white/5 border border-primary/10 flex items-center justify-center shrink-0">
                    <Package size={16} className="text-primary/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-primary/50 uppercase tracking-widest mt-0.5">Qty: {item.qty}</p>
                </div>
              </div>
            ))}
            {extraCount > 0 && (
              <p className="text-xs text-primary/40 italic">+ {extraCount} more item{extraCount > 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="w-full h-px bg-primary/15" />

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-widest text-primary/60">Order Total</span>
        <span className="font-serif text-lg text-primary">
          ${total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Carrier Info */}
      {(carrier || trackingNumber) && (
        <div className="bg-white/5 border border-primary/10 rounded-xl p-4 flex flex-col gap-2">
          {carrier && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-primary/50 w-20">Carrier</span>
              <span className="text-sm text-white font-medium">{carrier}</span>
            </div>
          )}
          {trackingNumber && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-primary/50 w-20">Tracking</span>
              {carrierTrackingUrl ? (
                <a
                  href={carrierTrackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-white transition-colors flex items-center gap-1 font-mono"
                >
                  {trackingNumber}
                  <ExternalLink size={11} />
                </a>
              ) : (
                <span className="text-sm text-white font-mono">{trackingNumber}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Estimated Delivery */}
      {estimatedDelivery && (
        <div className="flex items-start gap-3">
          <Calendar size={16} className={isUrgent ? 'text-primary mt-0.5' : 'text-white/40 mt-0.5'} />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary/60 mb-0.5">Estimated Delivery</p>
            <p className={`text-sm font-medium ${isUrgent ? 'text-primary font-bold' : 'text-white'}`}>
              {formatDate(estimatedDelivery)}
              {isUrgent && <span className="ml-2 text-[10px] text-primary/70">(Arriving soon!)</span>}
            </p>
          </div>
        </div>
      )}

      {/* Delivery address (masked) */}
      {shippingAddress && (
        <div className="flex items-start gap-3">
          <MapPin size={16} className="text-white/40 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary/60 mb-0.5">Delivering to</p>
            <p className="text-sm text-white/70">
              {userName && <span className="text-white">{userName}<br /></span>}
              {maskAddress(shippingAddress)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingSummary;
