import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Minus,
  Maximize2,
  Minimize2,
  HelpCircle,
  ShieldCheck,
  Truck,
  Ruler,
  Scissors,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Product, CartItem } from '../types';
import { Language } from '../data/translations';
import { formatPrice } from '../utils/currency';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  matchedProducts?: string[];
}

interface ConciergeChatBotProps {
  language: Language;
  currency: string;
  cartItems: CartItem[];
  wishlistIds: string[];
  allProducts: Product[];
  onSelectProduct?: (product: Product) => void;
  onOpenSizeGuide?: () => void;
  onOpenShoppingBag?: () => void;
}

export const ConciergeChatBot: React.FC<ConciergeChatBotProps> = ({
  language,
  currency,
  cartItems,
  wishlistIds,
  allProducts,
  onSelectProduct,
  onOpenSizeGuide,
  onOpenShoppingBag,
}) => {
  const isEs = language === 'es';
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initial welcome message
  const getInitialMessages = (): ChatMessage[] => [
    {
      id: 'welcome-1',
      sender: 'bot',
      text: isEs
        ? "¡Hola! Soy el **Concierge Virtual de Mari's**. Estoy aquí para resolver todas tus dudas sobre nuestras prendas de alta costura, materiales nobles (Cashmere Loro Piana, seda Mulberry), guía de tallas, envíos exprés internacionales o políticas de devolución.\n\n¿En qué puedo asistirte hoy?"
        : "Welcome to **Mari's Atelier Concierge**. I am here to assist you with any questions regarding our noble fabrics (Loro Piana virgin cashmere, Mulberry silk), sizing guidance, complimentary worldwide express shipping, or care instructions.\n\nHow may I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages);

  // When language changes, reset or update initial if only welcome message
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome-1') {
      setMessages(getInitialMessages());
    }
  }, [language]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Speech Recognition (Speech to Text)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isEs ? 'es-ES' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isEs]);

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      alert(isEs ? "El reconocimiento de voz no está soportado en este navegador." : "Voice recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = isEs ? 'es-MX' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error starting speech recognition", err);
        setIsListening(false);
      }
    }
  };

  // Text-to-speech audio reader
  const speakMessage = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*_#•-]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isEs ? 'es-ES' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : inputText).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.sender, content: m.text })),
          userMessage: textToSend,
          currentCart: cartItems,
          wishlist: wishlistIds,
          products: allProducts,
          language,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Chatbot service unavailable');
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || (isEs ? "Con gusto le asisto con cualquier duda sobre nuestra colección." : "I am delighted to assist you with any questions."),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot request error:", err);
      const fallbackMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: isEs
          ? "Nuestro Concierge está listo para resolver tus dudas. Ofrecemos **envío exprés gratuito en pedidos superiores a $500 USD**, 14 días de devoluciones sin costo y confección de lujo en **Cashmere virgen Loro Piana** y **Seda Mulberry**. ¿En qué otra consulta puedo ayudarte?"
          : "Mari's Atelier Concierge is at your service. All orders over **$500 USD include complimentary worldwide express shipping**, 14-day free returns, and Italian tailoring in **Loro Piana virgin cashmere** and **Mulberry silk**. How else may I assist you?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setMessages(getInitialMessages());
  };

  // Quick FAQ prompt chips for solving common doubts
  const doubtChips = isEs
    ? [
        { label: "🧵 Materiales Nobles", query: "¿De qué materiales están hechas las prendas de Mari's?" },
        { label: "📏 Guía de Tallas", query: "¿Cómo elijo mi talla adecuada y qué medidas corresponden?" },
        { label: "✈️ Envíos y Tiempos", query: "¿Cuáles son los tiempos de envío y el costo de entrega?" },
        { label: "🔄 Devoluciones", query: "¿Cómo funciona la política de devoluciones y cambios de talla?" },
        { label: "🧺 Cuidados del Cashmere", query: "¿Cómo debo cuidar y lavar las prendas de cashmere y seda?" },
        { label: "🛍️ ¿Cómo Comprar?", query: "¿Cómo agrego prendas a la bolsa y realizo mi compra?" },
      ]
    : [
        { label: "🧵 Noble Fabrics", query: "What materials and noble fibers are used in Mari's garments?" },
        { label: "📏 Size & Fit Guide", query: "How do I choose the correct size and what are the measurements?" },
        { label: "✈️ Express Shipping", query: "What are the shipping transit times and express delivery policies?" },
        { label: "🔄 14-Day Returns", query: "How does the return and size exchange policy work?" },
        { label: "🧺 Garment Care", query: "How should I clean and care for virgin cashmere and Mulberry silk?" },
        { label: "🛍️ How to Order", query: "How do I add items to my shopping bag and checkout?" },
      ];

  // Helper to format bot text with bold and list styling
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-[13px] leading-relaxed text-[#2C2A29]">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Highlight bullet points
          if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
            const content = line.replace(/^[•\-*]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 text-[#2C2A29]">
                <span className="text-[#B88A58] text-xs mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatBold(content) }} />
              </div>
            );
          }

          // Numbered lists
          const numMatch = line.match(/^(\d+)\.\s*(.*)$/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 text-[#2C2A29]">
                <span className="text-[#B88A58] font-bold text-xs mt-0.5">{numMatch[1]}.</span>
                <span dangerouslySetInnerHTML={{ __html: formatBold(numMatch[2]) }} />
              </div>
            );
          }

          return <p key={idx} dangerouslySetInnerHTML={{ __html: formatBold(line) }} />;
        })}
      </div>
    );
  };

  const formatBold = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#1C1B20]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  };

  return (
    <>
      {/* Floating Concierge Chatbot Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-auto">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="flex items-center gap-3"
            >
              {/* Optional greeting pill */}
              <div
                onClick={() => {
                  setIsOpen(true);
                  setIsMinimized(false);
                }}
                className="hidden sm:flex items-center gap-2 bg-[#1C1B20] text-[#FBF9F5] px-3.5 py-2 rounded-full shadow-lg border border-[#3E3C45] cursor-pointer hover:border-[#B88A58] transition-all group"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B88A58] animate-pulse" />
                <span className="text-xs font-medium tracking-wide">
                  {isEs ? '¿Dudas? Chatea con el Concierge IA' : 'Doubts? Chat with AI Concierge'}
                </span>
              </div>

              <button
                id="btn-open-chatbot"
                onClick={() => {
                  setIsOpen(true);
                  setIsMinimized(false);
                  setHasUnread(false);
                }}
                className="relative p-3.5 sm:p-4 bg-[#1C1B20] hover:bg-[#2A2930] text-[#F4F0EA] rounded-full shadow-2xl border border-[#B88A58]/40 hover:border-[#B88A58] transition-all duration-300 transform hover:scale-105 group focus:outline-none focus:ring-2 focus:ring-[#B88A58]"
                aria-label={isEs ? 'Abrir Chat de Dudas y Asistencia' : 'Open Concierge Doubt Solver Chat'}
              >
                <div className="relative">
                  <MessageSquare className="w-6 h-6 text-[#E8D0B5] group-hover:text-[#B88A58] transition-colors" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#1C1B20] animate-pulse"></span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chatbot Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`w-[calc(100vw-32px)] sm:w-[420px] bg-[#FBF9F5] border border-[#E8E2D9] rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
                isMinimized ? 'h-16' : 'h-[620px] max-h-[85vh]'
              }`}
            >
              {/* Header */}
              <div className="bg-[#1C1B20] text-[#FBF9F5] p-3.5 sm:p-4 border-b border-[#3E3C45] flex items-center justify-between select-none">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-[#2A2930] border border-[#B88A58] flex items-center justify-center text-[#B88A58]">
                      <Bot className="w-5 h-5" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#1C1B20]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-serif text-base font-light tracking-wide text-white">
                        {isEs ? "Mari's Concierge IA" : "Mari's AI Concierge"}
                      </h3>
                      <span className="bg-[#B88A58]/20 text-[#B88A58] text-[9px] px-1.5 py-0.5 rounded-sm font-mono uppercase font-bold tracking-wider">
                        {isEs ? 'DUDAS & ASESORÍA' : 'DOUBTS & CARE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A8A09B] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                      {isEs ? 'En línea • Respuesta instantánea' : 'Online • Instant assistance'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleClearHistory}
                    className="p-1.5 text-[#A8A09B] hover:text-white rounded-md hover:bg-white/10 transition-colors"
                    title={isEs ? 'Reiniciar conversación' : 'Clear chat history'}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1.5 text-[#A8A09B] hover:text-white rounded-md hover:bg-white/10 transition-colors"
                    title={isMinimized ? (isEs ? 'Expandir' : 'Expand') : (isEs ? 'Minimizar' : 'Minimize')}
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      if (window.speechSynthesis) window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                      setIsOpen(false);
                    }}
                    className="p-1.5 text-[#A8A09B] hover:text-white rounded-md hover:bg-white/10 transition-colors"
                    title={isEs ? 'Cerrar (Esc)' : 'Close (Esc)'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Content Body */}
              {!isMinimized && (
                <>
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F2]/60">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.sender === 'bot' && (
                          <div className="w-7 h-7 rounded-full bg-[#1C1B20] text-[#B88A58] flex items-center justify-center shrink-0 mt-0.5 border border-[#B88A58]/30">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] rounded-lg p-3 sm:p-3.5 text-xs shadow-sm relative group ${
                            msg.sender === 'user'
                              ? 'bg-[#1C1B20] text-[#FBF9F5] rounded-tr-none'
                              : 'bg-white text-[#1A1A1A] border border-[#E8E2D9] rounded-tl-none'
                          }`}
                        >
                          {msg.sender === 'bot' ? (
                            <>
                              {renderFormattedText(msg.text)}

                              <div className="mt-2.5 pt-2 border-t border-[#F0EAE1] flex items-center justify-between text-[10px] text-[#8C9083]">
                                <span>{msg.timestamp}</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => speakMessage(msg.text)}
                                    className="p-1 hover:text-[#B88A58] rounded transition-colors"
                                    title={isSpeaking ? (isEs ? 'Detener voz' : 'Stop voice') : (isEs ? 'Escuchar en voz alta' : 'Listen')}
                                  >
                                    {isSpeaking ? <VolumeX className="w-3 h-3 text-[#B88A58]" /> : <Volume2 className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-[13px] leading-relaxed text-[#FBF9F5]">{msg.text}</p>
                              <div className="mt-1 text-right text-[10px] text-[#A8A09B]">
                                {msg.timestamp}
                              </div>
                            </>
                          )}
                        </div>

                        {msg.sender === 'user' && (
                          <div className="w-7 h-7 rounded-full bg-[#B88A58] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {/* Typing Loading Indicator */}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2.5"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#1C1B20] text-[#B88A58] flex items-center justify-center shrink-0 border border-[#B88A58]/30">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-white border border-[#E8E2D9] rounded-lg rounded-tl-none p-3 shadow-sm flex items-center gap-2">
                          <span className="text-[11px] text-[#8C9083] font-medium tracking-wide">
                            {isEs ? 'El Concierge está redactando...' : 'Concierge is typing...'}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#B88A58] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-[#B88A58] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-[#B88A58] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Frequently Asked Doubt Chips (Quick Actions) */}
                  <div className="px-3 py-2 bg-[#F4F0EA] border-t border-[#E8E2D9] overflow-x-auto scrollbar-none flex items-center gap-1.5 text-[11px]">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C9083] whitespace-nowrap pl-1">
                      {isEs ? 'Dudas Frecuentes:' : 'Quick Questions:'}
                    </span>
                    {doubtChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputText(chip.query);
                          handleSendMessage(chip.query);
                        }}
                        className="shrink-0 px-2.5 py-1 bg-white hover:bg-[#1C1B20] text-[#1A1A1A] hover:text-white border border-[#E8E2D9] hover:border-[#1C1B20] rounded-full transition-all text-[11px] font-medium shadow-xs"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Input Footer Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="p-3 bg-white border-t border-[#E8E2D9] flex items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={toggleVoiceRecognition}
                      className={`p-2 rounded-lg border transition-all ${
                        isListening
                          ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                          : 'bg-[#F4F0EA] text-[#1A1A1A] hover:text-[#B88A58] border-[#E8E2D9]'
                      }`}
                      title={isListening ? (isEs ? 'Escuchando tu voz...' : 'Listening...') : (isEs ? 'Preguntar por voz' : 'Ask by voice')}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <input
                      id="input-chatbot-doubt"
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={
                        isListening
                          ? (isEs ? 'Escuchando tu duda...' : 'Listening to your question...')
                          : (isEs ? 'Escribe cualquier duda (tallas, envíos, telas)...' : 'Ask any doubt (fabrics, sizes, shipping)...')
                      }
                      className="flex-1 bg-[#FBF9F5] border border-[#E8E2D9] focus:border-[#B88A58] focus:ring-1 focus:ring-[#B88A58] rounded-lg px-3.5 py-2 text-xs text-[#1A1A1A] placeholder-[#8C9083] focus:outline-none transition-all"
                    />

                    <button
                      id="btn-send-chatbot"
                      type="submit"
                      disabled={!inputText.trim() || isLoading}
                      className={`p-2.5 rounded-lg text-white font-medium transition-all ${
                        inputText.trim() && !isLoading
                          ? 'bg-[#1C1B20] hover:bg-[#B88A58] shadow-md cursor-pointer'
                          : 'bg-[#E8E2D9] text-[#8C9083] cursor-not-allowed'
                      }`}
                      aria-label={isEs ? 'Enviar duda' : 'Send question'}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
