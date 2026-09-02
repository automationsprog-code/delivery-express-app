import React, { useState, useEffect, useRef } from 'react';
import { useOrder } from '../../context/OrderContext';
import { 
  X, 
  Send, 
  MessageCircle, 
  Bike, 
  User, 
  ShieldCheck,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export default function OrderChatModal({ order, onClose, senderRole = 'customer' }) {
  const { sendMessage } = useOrder();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const messages = order?.messages || [
    {
      id: 'msg-1',
      senderRole: 'rider',
      senderName: order?.riderName || 'Kuya Junrey (Rider)',
      text: 'Maayong adlaw! Ako ang imong Delivery Express rider. Padulong na ko sa pickup location.',
      time: '10 mins ago'
    },
    {
      id: 'msg-2',
      senderRole: 'customer',
      senderName: order?.customerName || 'Customer',
      text: 'Salamat kuya! Palihug ko text inig abot nimo sa eskina.',
      time: '8 mins ago'
    }
  ];

  const quickReplies = senderRole === 'customer' 
    ? [
        "Padulong na ka kuya?",
        "Nasa green gate mi dapit",
        "GCash ako payment kuya",
        "Salamat kaayo!"
      ]
    : [
        "Naa nako sa store / purchasing",
        "Padulong na ko sa inyo sir/ma'am",
        "Naa nako sa eskina",
        "Salamat kaayo!"
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(order.id, senderRole, senderRole === 'customer' ? order.customerName : (order.riderName || 'Rider'), inputText.trim());
    setInputText('');
  };

  const handleQuickSend = (text) => {
    sendMessage(order.id, senderRole, senderRole === 'customer' ? order.customerName : (order.riderName || 'Rider'), text);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[600px]">
        
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-rose-600 to-amber-500 text-white p-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/30">
                {senderRole === 'customer' ? <Bike className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-rose-600 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-sm text-white">
                  {senderRole === 'customer' ? (order?.riderName || 'Delivery Express Courier') : order?.customerName}
                </h4>
                <span className="bg-black/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-rose-100 font-medium">
                Order #{order?.trackingNumber} • Balamban
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {order?.riderPhone && senderRole === 'customer' && (
              <a
                href={`tel:${order.riderPhone}`}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="Call Rider"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-zinc-950">
          <div className="text-center my-2">
            <span className="text-[10px] bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-3 py-1 rounded-full font-semibold">
              🔒 In-App Direct Chat for Order #{order?.trackingNumber}
            </span>
          </div>

          {messages.map((msg, idx) => {
            const isMe = msg.senderRole === senderRole;

            return (
              <div 
                key={msg.id || idx} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 mb-0.5 px-1 font-medium">
                  {msg.senderName} • {msg.time}
                </span>

                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm leading-relaxed ${
                    isMe 
                      ? 'bg-rose-600 text-white rounded-br-none' 
                      : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700/80 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Canned Replies */}
        <div className="p-2 bg-slate-100 dark:bg-zinc-900/90 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[10px] text-slate-400 font-bold shrink-0 ml-1">⚡ Quick:</span>
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleQuickSend(reply)}
              className="text-[11px] px-3 py-1 bg-white dark:bg-zinc-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl border border-slate-200 dark:border-zinc-700 whitespace-nowrap transition-colors font-medium shrink-0 shadow-sm"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message in Balamban..."
            className="flex-1 bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white transition-all shadow-md shadow-rose-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}