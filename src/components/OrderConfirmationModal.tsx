import React from 'react';
import { CartItem } from '../types';
import { CheckCircle2, Package, Truck, Gift, Download, X, ArrowRight } from 'lucide-react';
import { formatPrice } from '../utils/currency';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: string;
  appliedDiscount: number;
  giftNote: string;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  appliedDiscount,
  giftNote
}) => {
  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const orderNumber = `ALE-${Math.floor(100000 + Math.random() * 900000)}`;
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const grandTotal = subtotal - appliedDiscount;

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1B20]/80 backdrop-blur-md p-4 transition-all animate-fadeIn">
      <div className="max-w-xl w-full bg-[#FBF9F5] rounded-sm shadow-2xl border border-[#E8E2D9] p-8 space-y-6 text-[#1A1A1A] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#8C9083] hover:text-[#1A1A1A] p-2 transition-colors"
          aria-label="Close Order Confirmation"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success Banner */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#B88A58]/20 text-[#B88A58] border border-[#B88A58] rounded-full mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#B88A58] font-bold">
            Order Confirmed
          </p>
          <h2 className="font-serif text-3xl font-light text-[#1A1A1A]">
            Thank You For Your Patronage
          </h2>
          <p className="text-xs text-[#666562] font-mono">
            Order Reference: <span className="text-[#1A1A1A] font-bold">{orderNumber}</span>
          </p>
        </div>

        {/* Shipping Estimates */}
        <div className="p-4 bg-[#F4F0EA] border border-[#E8E2D9] rounded-sm space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#1A1A1A] font-bold">
            <Truck className="w-4 h-4 text-[#B88A58]" />
            <span>Complimentary Express Air Courier</span>
          </div>
          <p className="text-[#666562]">
            Estimated Delivery: <strong className="text-[#1A1A1A]">2-4 Business Days</strong> with live satellite transit tracking.
          </p>
        </div>

        {/* Order Items */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
            Bespoke Order Summary
          </h4>
          <div className="space-y-3 divide-y divide-[#E8E2D9] max-h-48 overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div key={`${item.product.id}-${item.selectedSize}`} className="pt-3 first:pt-0 flex gap-3 items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-16 object-cover rounded-xs border border-[#E8E2D9]" />
                  <div>
                    <h5 className="font-serif text-sm text-[#1A1A1A] font-medium">{item.product.name}</h5>
                    <p className="text-[10px] text-[#8C9083] font-mono">Size: {item.selectedSize} • Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-sans text-sm font-medium text-[#1A1A1A] tabular-nums">
                  {formatPrice(item.product.price * item.quantity, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gift Note if exists */}
        {giftNote && (
          <div className="p-3 bg-white border border-[#E8E2D9] rounded-sm text-xs space-y-1">
            <span className="font-semibold text-[#B88A58] text-[10px] uppercase">Client Gift Message Attached:</span>
            <p className="italic text-[#4A4947]">"{giftNote}"</p>
          </div>
        )}

        {/* Total Paid */}
        <div className="pt-4 border-t border-[#E8E2D9] flex justify-between items-center">
          <span className="font-serif text-lg">Total Charge</span>
          <span className="font-sans text-2xl font-semibold text-[#1A1A1A] tabular-nums tracking-tight">
            {formatPrice(grandTotal, currency)}
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={onClose}
            className="w-full py-4 bg-[#1C1B20] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B88A58] transition-colors rounded-sm shadow-md"
          >
            Continue Exploring Mari's
          </button>
        </div>
      </div>
    </div>
  );
};
