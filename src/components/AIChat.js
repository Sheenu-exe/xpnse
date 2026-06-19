"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, User, Bot, Loader2 } from 'lucide-react';

export default function AIChat({ transactions, totalBalance, monthlyIncome, monthlySpending, userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [chatOptions, setChatOptions] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Yo! I'm Aura, your AI financial advisor. Ask me anything about your bag, burn rate, or if you can afford that new drop." }
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
  }, [messages, isOpen, chatOptions]);

  useEffect(() => {
    if (userId) {
      fetch(`/api/savings/accounts?userId=${userId}`)
        .then(res => res.json())
        .then(data => setAccounts(data))
        .catch(err => console.error(err));
    }
  }, [userId]);

  const handleSend = async (e, overrideText = null) => {
    if (e) e.preventDefault();
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isLoading) return;

    setInput('');
    setChatOptions([]);
    
    const newMessages = [...messages, { role: 'user', text: textToSend }];
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
          context: contextStr,
          userId,
          accounts
        })
      });

      const data = await res.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        if (data.options) {
          setChatOptions(data.options);
        }
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
        className={`fixed bottom-28 right-6 md:bottom-12 md:right-12 z-[110] p-4 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'} bg-forest-800/80 backdrop-blur-xl border border-white/10 group`}
      >
        <Sparkles className="w-6 h-6 text-foreground group-hover:text-sage transition-colors duration-300" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-24 right-4 md:bottom-10 md:right-10 w-[calc(100vw-32px)] md:w-[400px] h-[550px] max-h-[75vh] bg-forest-800/60 backdrop-blur-3xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] rounded-[32px] z-[120] flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right
        ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 pointer-events-none translate-y-10'}
        `}
      >
        {/* Header */}
        <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/5 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-sage" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base tracking-tight">Aura</h3>
              <p className="text-[11px] font-medium text-white/50 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sage shadow-[0_0_8px_rgba(50,215,75,0.8)]"></span> Online
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar scroll-smooth">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {msg.role === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-white/10 border border-white/5 flex items-center justify-center flex-shrink-0 mt-auto mb-1 mr-2">
                  <Sparkles className="w-3 h-3 text-sage" />
                </div>
              )}
              <div 
                className={`max-w-[80%] p-3.5 px-4 text-[15px] leading-relaxed tracking-tight ${
                  msg.role === 'user' 
                    ? 'bg-[#0A84FF] text-white rounded-[20px] rounded-br-sm shadow-sm' 
                    : 'bg-[#2C2C2E] text-foreground rounded-[20px] rounded-bl-sm border border-white/5 shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="self-start flex items-start max-w-[85%] animate-in fade-in">
               <div className="w-6 h-6 rounded-full bg-white/10 border border-white/5 flex items-center justify-center flex-shrink-0 mt-auto mb-1 mr-2">
                 <Sparkles className="w-3 h-3 text-sage" />
               </div>
               <div className="p-3.5 px-4 bg-[#2C2C2E] border border-white/5 rounded-[20px] rounded-bl-sm text-foreground flex items-center gap-1.5 shadow-sm">
                 <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                 <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                 <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
               </div>
            </div>
          )}
          
          {/* Options area */}
          {chatOptions.length > 0 && !isLoading && (
            <div className="flex flex-wrap gap-2 mt-1 ml-8 animate-in fade-in slide-in-from-bottom-2">
              {chatOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(null, opt)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-foreground rounded-full text-sm font-medium tracking-tight transition-all duration-300 active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/[0.02] border-t border-white/5">
          <form 
            onSubmit={(e) => handleSend(e)}
            className="flex items-center gap-2 bg-[#1C1C1E] border border-white/10 rounded-full p-1.5 shadow-inner focus-within:border-white/20 focus-within:ring-2 focus-within:ring-white/5 transition-all duration-300"
          >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Aura..."
              className="flex-1 bg-transparent border-none outline-none px-4 text-[15px] text-foreground placeholder:text-white/30"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-full bg-[#0A84FF] text-white disabled:opacity-50 disabled:bg-white/10 disabled:text-white/30 transition-all duration-300 hover:bg-opacity-90 active:scale-90"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
