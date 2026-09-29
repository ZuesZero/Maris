import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, ArrowRight } from 'lucide-react';
import { CartItem, Product } from '../types';

interface StylingConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  wishlistProducts: Product[];
  onSelectProduct: (product: Product) => void;
  allProducts: Product[];
}

export const StylingConciergeModal: React.FC<StylingConciergeModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  wishlistProducts,
  onSelectProduct,
  allProducts
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'stylist' | 'client'; text: string }>>([
    {
      sender: 'stylist',
      text: "Greetings. I am Mari's Senior Bespoke AI Stylist. How may I assist you with wardrobe pairing, occasion tailoring, or fabric provenance today?"
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    setMessages(prev => [...prev, { sender: 'client', text: userText }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userText,
          currentCart: cartItems.map(i => i.product.name),
          wishlist: wishlistProducts.map(p => p.name)
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'stylist', text: data.response || "Our master stylist recommends pairing our Loro Piana cashmere overcoat with our double-pleated flannel trousers." }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'stylist',
        text: "For an evening of understated distinction, pair our Double-Breasted Wool Blazer with our Pleated Flannel Trousers in Charcoal Tweed and a 19 momme Mulberry Silk shirt."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    "Winter Gala in Zurich",
    "Essential Minimalist Capsule",
    "How to style the Cashmere Overcoat",
    "Business meeting in Milan"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1B20]/80 backdrop-blur-md p-2 sm:p-4 transition-all animate-fadeIn">
      <div className="max-w-2xl w-full bg-[#FBF9F5] rounded-sm shadow-2xl border border-[#E8E2D9] flex flex-col h-[85vh] max-h-[650px] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-[#1C1B20] text-[#F4F0EA] flex items-center justify-between border-b border-[#3E3C45]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#B88A58]/20 border border-[#B88A58] flex items-center justify-center text-[#B88A58]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-light tracking-[0.1em] text-white">
                Mari's AI Bespoke Stylist
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-[#B88A58]">
                Bespoke Sartorial & Fabric Consultation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#A8A09B] hover:text-white transition-colors"
            aria-label="Close Stylist Modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F4F0EA]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'stylist' && (
                <div className="w-8 h-8 rounded-full bg-[#1C1B20] text-[#B88A58] flex items-center justify-center flex-shrink-0 text-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-md p-4 rounded-sm text-xs leading-relaxed ${
                  msg.sender === 'client'
                    ? 'bg-[#1C1B20] text-white font-medium'
                    : 'bg-white border border-[#E8E2D9] text-[#1A1A1A] shadow-xs'
                }`}
              >
                {msg.text}
              </div>

              {msg.sender === 'client' && (
                <div className="w-8 h-8 rounded-full bg-[#B88A58] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-[#8C9083]">
              <Sparkles className="w-4 h-4 animate-spin text-[#B88A58]" />
              <span>Consulting sartorial archives...</span>
            </div>
          )}
        </div>

        {/* Quick Sample Prompts */}
        <div className="p-3 bg-[#FBF9F5] border-t border-[#E8E2D9] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] uppercase font-mono text-[#8C9083] whitespace-nowrap">Suggested:</span>
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInputQuery(prompt);
              }}
              className="px-3 py-1 bg-[#F4F0EA] border border-[#E8E2D9] hover:border-[#B88A58] text-[10px] text-[#4A4947] font-medium rounded-full whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-[#E8E2D9] flex gap-3">
          <input
            type="text"
            placeholder="Ask for wardrobe pairings, sizing advice, or fabric details..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-[#F4F0EA] border border-[#E8E2D9] px-4 py-3 text-xs text-[#1A1A1A] rounded-xs focus:outline-none focus:border-[#B88A58] placeholder-[#8C9083]"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-6 py-3 bg-[#1C1B20] text-white text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-[#B88A58] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
