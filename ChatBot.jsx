import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hello! I am the OmniGen AI symptom checker. I see you're not feeling well. To help identify the problem, could you describe your main symptoms?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Format history, excluding the very first intro message if we want, or keeping it all
      const history = messages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        text: msg.text
      }));

      const response = await axios.post('http://localhost:5001/api/chat', {
        message: text,
        history
      });

      setMessages(prev => [...prev, { role: 'model', text: response.data.reply }]);
    } catch (error) {
      console.error("Error communicating with chat API:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to my service right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all z-40 flex items-center justify-center ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-[380px] h-[580px] max-h-[85vh] bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 border-b border-slate-700/80 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>
          <div className="flex items-center gap-3 relative z-10">
             <div className="p-2 bg-blue-500/20 rounded-lg text-cyan-400">
                <Bot className="w-5 h-5" />
             </div>
             <div>
               <h3 className="font-bold text-white text-sm tracking-wide">OmniGen AI</h3>
               <p className="text-[10px] text-cyan-400 font-medium uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                 Symptom Checker
               </p>
             </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white transition-colors relative z-10 bg-slate-800/50 hover:bg-slate-700 p-1.5 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0f18] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-200 border border-slate-700/50 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-xs font-medium tracking-wide">Analyzing symptoms...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex flex-col border-t border-slate-800 bg-[#111827]">
          {/* Quick Questions */}
          <div className="flex flex-wrap gap-2 px-3 pt-3 pb-1 overflow-x-auto scrollbar-none">
            {["Why this result?", "Is it safe?", "What if health improves?"].map((q, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(q)}
                disabled={isLoading}
                className="text-[10px] whitespace-nowrap font-semibold tracking-wide text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1.5 hover:bg-cyan-500/20 hover:text-cyan-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-cyan-900/10 active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="p-3 pt-2">
            <div className="relative flex items-end gap-2 bg-[#0a0f18] border border-slate-700/60 rounded-xl p-1.5 focus-within:border-cyan-500/50 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your symptoms..."
                className="w-full bg-transparent text-slate-200 text-sm p-2 outline-none resize-none max-h-32 min-h-[44px] scrollbar-thin scrollbar-thumb-slate-700"
                rows={1}
                style={{
                   height: "auto",
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="mb-1 mr-1 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-900/50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[9px] text-center text-slate-500 mt-3 font-medium tracking-wide">
              AI can make mistakes. Consider consulting a doctor.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
