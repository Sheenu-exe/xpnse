"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, User, Bot, Loader2 } from 'lucide-react';

export default function AIChat({ transactions, totalBalance, monthlyIncome, monthlySpending }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Yo! I'm X, your AI financial advisor. Ask me anything about your bag, burn rate, or if you can afford that new drop." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    
    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const contextStr = `
        Total Balance: $${totalBalance}
        Monthly Income: $${monthlyIncome}
        Monthly Spending: $${monthlySpending}
        Recent Txns: ${transactions.slice(0,5).map(t => t.category + ' $' + t.amount).join(', ')}
      `;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          context: contextStr
        })
      });

      const data = await res.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { role: 'ai', text: "Error: " + data.error + (data.reply ? ' - ' + data.reply : '') }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I lost connection to the mainframe. Try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={\`fixed bottom-24 right-6 md:bottom-10 md:right-10 z-50 p-4 rounded-full shadow-[0_0_30px_rgba(167,209,174,0.4)] transition-all hover:scale-110 active:scale-95 flex items-center justify-center \${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'} bg-gradient-to-br from-sage to-emerald-600 border border-sage/50 group\`}
      >
        <Sparkles className="w-6 h-6 text-forest-900 group-hover:animate-pulse" />
      </button>

      {/* Chat Window */}
      <div 
        className={\`fixed inset-0 md:inset-auto md:bottom-10 md:right-10 z-50 md:w-[400px] md:h-[600px] bg-forest-900/95 backdrop-blur-2xl md:rounded-[30px] border border-forest-700 shadow-luxury transition-all duration-300 ease-out flex flex-col \${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95 pointer-events-none'}\`}
      >
        {/* Header */}
        <div className="p-5 border-b border-forest-700 flex justify-between items-center bg-forest-800/50 md:rounded-t-[30px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(167,209,174,0.3)]">
              <Sparkles className="w-5 h-5 text-forest-900" />
            </div>
            <div>
              <h3 className="font-bold text-cream tracking-wide">Advisor X</h3>
              <p className="text-[10px] font-mono text-sage uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-forest-700 text-cream/50 hover:text-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide flex flex-col">
          {messages.map((msg, i) => (
            <div key={i} className={\`flex max-w-[85%] \${msg.role === 'user' ? 'self-end' : 'self-start'}\`}>
              <div className={\`flex items-start gap-2 \${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}\`}>
                <div className={\`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 \${msg.role === 'user' ? 'bg-forest-700' : 'bg-sage/20 border border-sage/30'}\`}>
                  {msg.role === 'user' ? <User className="w-3 h-3 text-cream/70" /> : <Bot className="w-3 h-3 text-sage" />}
                </div>
                <div className={\`p-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm \${msg.role === 'user' ? 'bg-forest-700 text-cream rounded-tr-sm' : 'bg-forest-800 border border-forest-700 text-cream/90 rounded-tl-sm'}\`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="self-start flex items-start gap-2 max-w-[85%]">
               <div className="w-6 h-6 rounded-full bg-sage/20 border border-sage/30 flex items-center justify-center flex-shrink-0 mt-1">
                 <Bot className="w-3 h-3 text-sage" />
               </div>
               <div className="p-3 bg-forest-800 border border-forest-700 rounded-2xl rounded-tl-sm text-sage/70 flex items-center gap-1 shadow-sm">
                 <span className="w-1.5 h-1.5 bg-sage/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                 <span className="w-1.5 h-1.5 bg-sage/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                 <span className="w-1.5 h-1.5 bg-sage/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-forest-700 bg-forest-800/50 md:rounded-b-[30px]">
          <form onSubmit={handleSend} className="flex gap-2 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your cash flow..."
              className="flex-1 bg-forest-900 border border-forest-600 rounded-full px-5 py-3 text-sm text-cream focus:outline-none focus:border-sage transition-colors placeholder:text-cream/30"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-11 h-11 rounded-full bg-sage flex items-center justify-center text-forest-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors shadow-luxury group"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[9px] font-mono uppercase tracking-widest text-cream/30">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
      </div>
    </>
  );
}
