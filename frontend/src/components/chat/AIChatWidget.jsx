import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { sendChatMessage } from '../../api/chat';
import Button from '../common/Button';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello Manager! Ask me anything about your team’s weekly reports or summary insights.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(userText);
      setMessages((prev) => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Error connecting to AI Assistant.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 text-white p-3.5 rounded-full shadow-lg hover:bg-primary-700 transition-all flex items-center gap-2"
        >
          <Bot size={22} />
          <span className="text-xs font-semibold pr-1 hidden sm:inline">AI Team Assistant</span>
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[480px]">
          <div className="p-3.5 bg-primary-600 text-white rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-semibold text-sm">AI Report Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary-700 p-1 rounded-lg">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`p-3 rounded-2xl max-w-[80%] whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-slate-400 text-[11px] italic">Analyzing team reports...</div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-2.5 border-t border-slate-100 flex gap-1.5">
            <input
              type="text"
              className="input-field text-xs py-1.5 flex-1"
              placeholder="e.g. What are the key blockers?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit" size="sm" loading={loading} className="px-3">
              <Send size={14} />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}