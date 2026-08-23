import { useState, useRef, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Send, MessageSquare, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axiosClient.post('/chat', { message: userMessage });
      if (response.data.success && response.data.data) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.data }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, failed to generate a response. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-5 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI Chat Assistant</h1>
          <p className="text-sm text-slate-400">Ask questions and get AI-powered answers</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 card-premium overflow-hidden flex flex-col min-h-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">Start a conversation</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Ask the AI assistant anything about your business data, campaigns, or general inquiries.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'gradient-primary text-white rounded-br-md shadow-lg shadow-primary/15'
                      : 'bg-slate-100 text-slate-700 rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* User avatar */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3 items-start animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-bl-md px-5 py-3.5">
                <div className="flex gap-1.5 items-center">
                  <span
                    className="w-2 h-2 rounded-full bg-slate-400"
                    style={{ animation: 'bounce-dot 1.4s ease-in-out infinite' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-slate-400"
                    style={{ animation: 'bounce-dot 1.4s ease-in-out 0.2s infinite' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-slate-400"
                    style={{ animation: 'bounce-dot 1.4s ease-in-out 0.4s infinite' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <form onSubmit={handleSend} className="flex gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="gradient-primary text-white p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
