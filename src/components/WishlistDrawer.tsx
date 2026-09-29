import React from 'react';
import { Product } from '../types';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { formatPrice } from '../utils/currency';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product, size: any, color: string) => void;
  onSelectProduct: (product: Product) => void;
  currency: string;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
  onSelectProduct,
  currency
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

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#1C1B20]/70 backdrop-blur-sm transition-all duration-300">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-[#FBF9F5] shadow-2xl flex flex-col justify-between border-l border-[#E8E2D9]">
          
          {/* Header */}
          <div className="p-6 bg-[#1C1B20] text-[#F4F0EA] flex items-center justify-between border-b border-[#3E3C45]">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-[#B88A58] fill-[#B88A58]" />
              <div>
                <h2 className="font-serif text-2xl font-light tracking-[0.1em] text-white">
                  Saved Wishlist
                </h2>
                <p className="text-[10px] uppercase tracking-widest text-[#8C9083]">
                  {wishlistProducts.length} Saved Pieces
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#A8A09B] hover:text-white transition-colors"
              aria-label="Close Wishlist"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {wishlistProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <Heart className="w-12 h-12 text-[#E8E2D9] mx-auto" />
                <h3 className="font-serif text-2xl text-[#1A1A1A]">No pieces saved yet</h3>
                <p className="text-xs text-[#666562] max-w-xs mx-auto">
                  Click the heart icon on any garment to save it for future curation.
                </p>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-[#E8E2D9]">
                {wishlistProducts.map((product) => (
                  <div key={product.id} className="pt-4 first:pt-0 flex gap-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-20 aspect-[3/4] object-cover rounded-sm border border-[#E8E2D9] cursor-pointer"
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                    />
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4
                            onClick={() => {
                              onSelectProduct(product);
                              onClose();
                            }}
                            className="font-serif text-lg text-[#1A1A1A] font-light hover:text-[#B88A58] cursor-pointer line-clamp-1"
                          >
                            {product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveFromWishlist(product.id)}
                            className="text-[#8C9083] hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm font-sans font-medium text-[#1A1A1A] tabular-nums tracking-tight">
                          {formatPrice(product.price, currency)}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          onAddToCart(product, product.sizes[0], product.colors[0]?.name || '');
                          onRemoveFromWishlist(product.id);
                        }}
                        className="w-full py-2 bg-[#1C1B20] text-white text-[10px] uppercase tracking-widest font-semibold rounded-xs hover:bg-[#B88A58] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 bg-[#F4F0EA] border-t border-[#E8E2D9]">
            <button
              onClick={onClose}
              className="w-full py-3 border border-[#1A1A1A] text-[#1A1A1A] text-xs uppercase tracking-widest font-semibold hover:bg-[#1A1A1A] hover:text-white transition-colors rounded-sm"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
