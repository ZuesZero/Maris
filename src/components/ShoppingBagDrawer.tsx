import React, { useState, useEffect } from 'react';
import { CartItem, Product, Size } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Tag, Gift, Truck } from 'lucide-react';
import { formatPrice } from '../utils/currency';

interface ShoppingBagDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, size: Size, color: string, delta: number) => void;
  onRemoveItem: (productId: string, size: Size, color: string) => void;
  onProceedToCheckout: (appliedDiscount: number, giftNote: string) => void;
  currency: string;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ShoppingBagDrawer: React.FC<ShoppingBagDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  currency,
  allProducts,
  onSelectProduct
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscountRate, setAppliedDiscountRate] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [includeGiftWrap, setIncludeGiftWrap] = useState(true);
  const [giftNote, setGiftNote] = useState('');

  // Close on Escape key
  useEffect(() => {
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

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 500;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const discountAmount = subtotal * appliedDiscountRate;
  const estimatedTax = subtotal * 0.08;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 45;
  const grandTotal = subtotal - discountAmount + shippingFee;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const code = promoCode.trim().toUpperCase();
    if (code === 'INNERCIRCLE' || code === 'ALES10' || code === 'MILAN') {
      setAppliedDiscountRate(0.10);
      setPromoSuccess('VIP 10% Patron Discount Applied');
    } else if (code === 'HERITAGE20') {
      setAppliedDiscountRate(0.20);
      setPromoSuccess('20% Seasonal Heritage Privilege Applied');
    } else {
      setPromoError('Invalid promo code. Try INNERCIRCLE for 10% off.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#1C1B20]/70 backdrop-blur-sm transition-all duration-300">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-xl bg-[#FBF9F5] shadow-2xl flex flex-col justify-between border-l border-[#E8E2D9]">
          
          {/* Header */}
          <div className="p-6 bg-[#1C1B20] text-[#F4F0EA] flex items-center justify-between border-b border-[#3E3C45]">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[#B88A58]" />
              <div>
                <h2 className="font-serif text-2xl font-light tracking-[0.1em] text-white">
                  Shopping Bag
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-[#8C9083]">
                  {cartItems.reduce((a, b) => a + b.quantity, 0)} Selected Garments
                </p>
              </div>
            </div>

            <button
              id="btn-close-bag"
              onClick={onClose}
              className="p-2 text-[#A8A09B] hover:text-white transition-colors"
              aria-label="Close Shopping Bag"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Complimentary Shipping Progress */}
          <div className="bg-[#F4F0EA] px-6 py-3 border-b border-[#E8E2D9] space-y-1">
            <div className="flex justify-between text-[11px] font-medium text-[#1A1A1A]">
              <span>
                {subtotal >= freeShippingThreshold ? (
                  <span className="text-[#B88A58] font-bold">✓ Qualified for Complimentary Worldwide Express Shipping</span>
                ) : (
                  <span>Add {formatPrice(freeShippingThreshold - subtotal, currency)} for Free Express Shipping</span>
                )}
              </span>
              <span className="font-mono">{Math.round(freeShippingProgress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#E8E2D9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#B88A58] transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-[#F4F0EA] border border-[#E8E2D9] rounded-full mx-auto flex items-center justify-center text-[#8C9083]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl text-[#1A1A1A]">Your bag is currently empty</h3>
                <p className="text-xs text-[#666562] max-w-xs mx-auto font-light">
                  Explore our Autumn 2026 collection of double-faced cashmere overcoats, silk blouses, and tailored trousers.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-[#1C1B20] text-white text-xs uppercase tracking-widest font-semibold rounded-sm hover:bg-[#B88A58] transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-[#E8E2D9]">
                {cartItems.map((item, idx) => (
                  <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="pt-6 first:pt-0 flex gap-4">
                    {/* Item Image */}
                    <div
                      className="w-24 aspect-[3/4] bg-[#F4F0EA] rounded-sm overflow-hidden flex-shrink-0 cursor-pointer border border-[#E8E2D9]"
                      onClick={() => {
                        onSelectProduct(item.product);
                        onClose();
                      }}
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4
                            onClick={() => {
                              onSelectProduct(item.product);
                              onClose();
                            }}
                            className="font-serif text-lg text-[#1A1A1A] font-light hover:text-[#B88A58] cursor-pointer"
                          >
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedColor)}
                            className="text-[#8C9083] hover:text-[#B88A58] p-1 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-[11px] text-[#8C9083] uppercase tracking-wider font-mono mt-0.5">
                          Color: {item.selectedColor} • Size: {item.selectedSize}
                        </p>
                      </div>

                      {/* Quantity & Unit Price */}
                      <div className="flex items-center justify-between pt-2">
                        {(() => {
                          const availableStock = (item.product.stock && item.product.stock[item.selectedSize] !== undefined)
                            ? item.product.stock[item.selectedSize]
                            : (item.product.stockQuantity !== undefined ? item.product.stockQuantity : 99);
                          const isMaxReached = item.quantity >= availableStock;

                          return (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-[#E8E2D9] bg-white rounded-xs">
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.selectedColor, -1)}
                                  className="p-1.5 text-[#1A1A1A] hover:bg-[#F4F0EA] transition-colors"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-3 text-xs font-mono font-bold text-[#1A1A1A]">
                                  {item.quantity}
                                </span>
                                <button
                                  disabled={isMaxReached}
                                  onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.selectedColor, 1)}
                                  className={`p-1.5 transition-colors ${
                                    isMaxReached
                                      ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                      : 'text-[#1A1A1A] hover:bg-[#F4F0EA] cursor-pointer'
                                  }`}
                                  title={isMaxReached ? `Max stock available reached (${availableStock} pcs)` : "Increase quantity"}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {isMaxReached && (
                                <span className="text-[9px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-2xs">
                                  Max ({availableStock} disp.)
                                </span>
                              )}
                            </div>
                          );
                        })()}

                        <span className="font-sans text-sm sm:text-base font-medium text-[#1A1A1A] tabular-nums tracking-tight">
                          {formatPrice(item.product.price * item.quantity, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Complimentary Gift Services Box */}
            {cartItems.length > 0 && (
              <div className="p-4 bg-[#F4F0EA] border border-[#E8E2D9] rounded-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
                  <Gift className="w-4 h-4 text-[#B88A58]" />
                  <span>Complimentary House Presentation</span>
                </div>

                <label className="flex items-center gap-2 text-xs text-[#4A4947] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeGiftWrap}
                    onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                    className="accent-[#1C1B20]"
                  />
                  <span>Include signature velvet gift wrapping & cedar garment bag</span>
                </label>

                {includeGiftWrap && (
                  <textarea
                    placeholder="Personalized handwritten message from client concierge (optional)..."
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    className="w-full p-2 bg-white border border-[#E8E2D9] text-xs text-[#1A1A1A] rounded-xs focus:outline-none placeholder-[#8C9083] h-16 resize-none"
                  ></textarea>
                )}
              </div>
            )}

            {/* Promo Code Input */}
            {cartItems.length > 0 && (
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-2.5 text-[#8C9083]" />
                    <input
                      type="text"
                      placeholder="Promo or VIP Code (e.g. INNERCIRCLE)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E2D9] text-xs text-[#1A1A1A] rounded-xs uppercase placeholder-normal"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1C1B20] text-white text-xs uppercase font-semibold tracking-wider rounded-xs hover:bg-[#B88A58] transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {promoSuccess && (
                  <p className="text-[11px] text-[#B88A58] font-mono">✓ {promoSuccess}</p>
                )}
                {promoError && (
                  <p className="text-[11px] text-red-600 font-mono">{promoError}</p>
                )}
              </form>
            )}
          </div>

          {/* Checkout Footer Breakdown */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-[#F4F0EA] border-t border-[#E8E2D9] space-y-4">
              <div className="space-y-2 text-xs text-[#666562]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#1A1A1A]">{formatPrice(subtotal, currency)}</span>
                </div>

                {appliedDiscountRate > 0 && (
                  <div className="flex justify-between text-[#B88A58] font-semibold">
                    <span>VIP Privilege ({appliedDiscountRate * 100}%)</span>
                    <span className="font-mono">-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Express Worldwide Courier</span>
                  <span className="font-mono text-[#1A1A1A]">
                    {shippingFee === 0 ? 'COMPLIMENTARY' : formatPrice(shippingFee, currency)}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E8E2D9] flex justify-between items-center text-sm font-semibold text-[#1A1A1A]">
                  <span className="font-serif text-lg">Total</span>
                  <span className="font-sans text-2xl font-semibold text-[#1A1A1A] tabular-nums tracking-tight">
                    {formatPrice(grandTotal, currency)}
                  </span>
                </div>
              </div>

              <button
                id="btn-proceed-checkout"
                onClick={() => onProceedToCheckout(discountAmount, giftNote)}
                className="w-full py-4 bg-[#1C1B20] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B88A58] transition-colors rounded-sm shadow-xl flex items-center justify-center gap-2"
              >
                <span>Proceed to Bespoke Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[10px] text-[#8C9083] uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B88A58]" />
                <span>256-Bit Encrypted Luxury Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
