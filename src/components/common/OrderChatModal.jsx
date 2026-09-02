import React, { useState, useEffect, useRef } from 'react';
import { useOrder } from '../../context/OrderContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { soundService } from '../../lib/soundUtils';
import { 
  X, 
  Send, 
  Bike, 
  User, 
  ShieldCheck,
  PhoneCall,
  Check,
  CheckCheck,
  Sparkles,
  MapPin,
  Clock,
  ArrowLeft
} from 'lucide-react';

export default function OrderChatModal({ order, onClose, senderRole = 'customer' }) {
  const { sendMessage, riders } = useOrder();
  const [inputText, setInputText] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [localMessages, setLocalMessages] = useState(order?.messages || []);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const channelRef = useRef(null);

  const myName = senderRole === 'customer' 
    ? (order?.customerName || 'Customer') 
    : (order?.riderName || 'Courier');

  const otherPersonName = senderRole === 'customer' 
    ? (order?.riderName || 'Nigel') 
    : (order?.customerName || 'Customer');

  const assignedRiderObj = riders.find(r => r.id === order?.riderId || r.name === order?.riderName);
  const riderAvatar = assignedRiderObj?.avatar || localStorage.getItem(`rider_avatar_${order?.riderId}`) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  const orderTracking = order?.trackingNumber || order?.id || 'DE-BALAMBAN';

  // Grab-Style Canned Quick Chips
  const quickReplies = senderRole === 'customer' 
    ? [
        "Padulong na ka kuya?",
        "Nasa green gate mi dapit",
        "GCash ako payment kuya",
        "Palihug ko tawag inig abot",
        "Salamat kaayo!"
      ]
    : [
        "Naa nako sa store / purchasing",
        "Na-purchase na nako ang items",
        "Padulong na ko sa inyong drop-off",
        "Naa nako sa gawas sa gate",
        "Salamat kaayo!"
      ];

  // Sync initial and context messages
  useEffect(() => {
    if (order?.messages) {
      setLocalMessages(order.messages);
    }
  }, [order?.messages]);

  // Realtime Supabase Broadcast Channel for Zero-Delay Chat & Live Typing Indicator
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channelName = `order-chat-instant-${orderTracking}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } }
    });

    channel
      .on('broadcast', { event: 'instant_message' }, ({ payload }) => {
        setLocalMessages(prev => {
          if (prev.some(m => m.id === payload.id)) return prev;
          return [...prev, payload];
        });
        setIsOtherTyping(false);
        soundService.playOrderChime();
        soundService.triggerVibrate([60]);
      })
      .on('broadcast', { event: 'typing_state' }, ({ payload }) => {
        if (payload.senderRole !== senderRole) {
          setIsOtherTyping(payload.isTyping);
          if (payload.isTyping) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              setIsOtherTyping(false);
            }, 3000);
          }
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [orderTracking, senderRole]);

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages, isOtherTyping]);

  // Broadcast typing indicator
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing_state',
        payload: { senderRole, isTyping: text.length > 0 }
      });
    }
  };

  const executeSend = (textToSend) => {
    if (!textToSend.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderRole,
      senderName: myName,
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Instant local optimistic update
    setLocalMessages(prev => [...prev, newMsg]);

    // Zero-delay WebSocket Broadcast to recipient device
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'instant_message',
        payload: newMsg
      });
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing_state',
        payload: { senderRole, isTyping: false }
      });
    }

    // Persist to Supabase Database in background
    sendMessage(order.id, senderRole, myName, textToSend.trim());

    setInputText('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeSend(inputText);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="relative w-full h-[100dvh] sm:h-[650px] sm:max-h-[92vh] max-w-lg bg-white dark:bg-zinc-900 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* GRAB-STYLE CHAT HEADER (ALWAYS PINNED TO VERY TOP OF MOBILE SCREEN) */}
        <div className="bg-[#00B14F] text-white px-4 py-3.5 sm:py-4 flex items-center justify-between shadow-md shrink-0 z-30">
          <div className="flex items-center gap-2.5">
            {/* Mobile Quick Back Button */}
            <button
              onClick={onClose}
              className="p-2 -ml-1.5 rounded-2xl hover:bg-white/20 text-white transition-colors"
              title="Close / Back"
            >
              <ArrowLeft className="w-5 h-5 sm:hidden" />
              <X className="w-5 h-5 hidden sm:block" />
            </button>

            <div className="relative">
              <img
                src={senderRole === 'customer' ? riderAvatar : (order?.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')}
                alt={otherPersonName}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover border-2 border-white/80 shadow-md bg-white"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-300 border-2 border-[#00B14F] rounded-full animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-black text-sm sm:text-base text-white font-heading truncate max-w-[150px] sm:max-w-[200px]">
                  {otherPersonName}
                </h4>
                <span className="bg-white/20 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-white/20">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-200" />
                  <span>Verified</span>
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-medium flex items-center gap-1 mt-0.5">
                <span>#{orderTracking}</span>
                <span>•</span>
                <span className="text-white font-bold">{order?.serviceName || 'Express'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {order?.riderPhone && senderRole === 'customer' && (
              <a
                href={`tel:${order.riderPhone}`}
                className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-all shadow-sm flex items-center gap-1"
                title="Direct Call"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-black/20 hover:bg-black/40 text-white transition-colors hidden sm:flex items-center justify-center"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grab Order Summary Mini Ribbon */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60 px-4 py-2 flex items-center justify-between text-xs shrink-0 z-20">
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold truncate max-w-[240px] sm:max-w-[320px]">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{order?.dropoffAddress || 'Balamban, Cebu'}</span>
          </div>
          <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 bg-white dark:bg-zinc-800 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 shrink-0">
            ₱{order?.estimatedFare || 100} COD
          </span>
        </div>

        {/* MESSAGE THREAD HISTORY (SCROLLS SMOOTHLY IN MIDDLE) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F7F9FA] dark:bg-zinc-950">
          <div className="text-center my-1">
            <span className="text-[10px] bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 px-3 py-1 rounded-full font-bold border border-slate-200 dark:border-zinc-800 shadow-2xs inline-flex items-center gap-1">
              <span>🔒 Zero-Delay Realtime Chat</span>
            </span>
          </div>

          {localMessages.map((msg, idx) => {
            const isMe = msg.senderRole === senderRole;

            return (
              <div 
                key={msg.id || idx} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fadeIn`}
              >
                <div className="flex items-baseline gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                    {msg.senderName}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500">
                    {msg.time}
                  </span>
                </div>

                <div 
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-sm leading-relaxed ${
                    isMe 
                      ? 'bg-[#00B14F] text-white rounded-br-xs' 
                      : 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-slate-200/80 dark:border-zinc-700/80 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  
                  {isMe && (
                    <div className="flex justify-end items-center gap-0.5 mt-1 text-[9px] text-emerald-100 opacity-90">
                      <span>Sent</span>
                      <CheckCheck className="w-3 h-3 inline" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* REAL-TIME LIVE TYPING INDICATOR */}
          {isOtherTyping && (
            <div className="flex items-center gap-2.5 p-3 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl w-fit shadow-sm animate-fadeIn">
              <span className="flex gap-1 items-center px-1">
                <span className="w-2 h-2 bg-[#00B14F] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-[#00B14F] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-[#00B14F] rounded-full animate-bounce"></span>
              </span>
              <span className="text-xs font-bold text-[#00B14F]">
                {otherPersonName} is typing...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* QUICK CANNED REPLIES (Grab Chips Style) */}
        <div className="p-2.5 bg-slate-100 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto shrink-0 z-20">
          <span className="text-[10px] text-[#00B14F] font-black shrink-0 ml-1">⚡ Quick:</span>
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              type="button"
              onClick={() => executeSend(reply)}
              className="text-[11px] px-3.5 py-1.5 bg-white dark:bg-zinc-800 hover:bg-emerald-50 hover:text-[#00B14F] hover:border-emerald-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-2xl border border-slate-300 dark:border-zinc-700 whitespace-nowrap transition-all font-bold shrink-0 shadow-2xs"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* GRAB INPUT COMPOSER (PINNED TO BOTTOM) */}
        <form onSubmit={handleFormSubmit} className="p-3 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-2 shrink-0 z-20 pb-4 sm:pb-3">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={`Message ${otherPersonName}...`}
            className="flex-1 bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#00B14F]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-[#00B14F] hover:bg-emerald-600 disabled:opacity-40 text-white transition-all shadow-md shadow-emerald-500/20 font-black"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}