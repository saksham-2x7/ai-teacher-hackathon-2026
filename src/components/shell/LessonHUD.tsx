'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Send, User, Bot, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAudioLipSync } from '../../hooks/useAudioLipSync';


interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

export default function LessonHUD() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { profile } = useAuthStore();
  const tutorGender = profile?.tutorGender || 'female';
  const { connectAudioElement } = useAudioLipSync();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Hook into SSE Client globally for AI responses initiated outside this chat
  useEffect(() => {
    // When the stream starts or pushes a teaching turn, add it to chat!
    // Since liveSSEClient doesn't expose a global subscribe yet, we'll just handle 
    // the chat interactions locally here for now.
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);
    setIsProcessing(true);

    try {
      const sessionId = sessionStorage.getItem('hexagon_session_id');
      if (!sessionId) throw new Error('No session ID');

      // Use relative path for Next.js proxy -> Vercel Backend
      const res = await fetch(`/api/v1/sessions/${sessionId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_input: userMsg })
      });

      if (!res.ok) throw new Error('Failed to send message');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        
        // Basic SSE parser
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const text = data.spoken_text || data.message || '';
              if (text) {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text }]);
              }
            } catch (err) {}
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Top Navigation Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white/90">Polymorphic Kernel</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400/80 tracking-widest uppercase">System Optimal</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* NEW FEATURE: Axiom Neural Chat Interface (Replaces Semantic Telemetry) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-6 left-6 w-80 sm:w-96 flex flex-col pointer-events-auto h-[400px]"
      >
        <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold tracking-wider text-gray-200 uppercase">Axiom Neural Link</span>
          </div>

          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center text-center text-gray-500 text-xs font-mono">
                  Ready to interact. Send a message to guide the lesson.
                </motion.div>
              ) : (
                messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'}`}>
                      {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </div>
                    <div className={`text-sm px-3 py-2 rounded-xl max-w-[85%] ${
                      msg.role === 'user' 
                        ? 'bg-indigo-500/20 text-indigo-100 rounded-tr-sm' 
                        : 'bg-white/5 text-gray-200 rounded-tl-sm border border-white/5'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))
              )}
              {isProcessing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-purple-500/20 text-purple-400">
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className="text-sm px-3 py-2 rounded-xl bg-white/5 text-gray-400 rounded-tl-sm border border-white/5 flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-black/20">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask a question or reply..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-white placeholder-gray-500"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className="absolute right-2 p-1.5 text-gray-400 hover:text-white disabled:opacity-50 transition-colors bg-white/5 hover:bg-white/10 rounded-lg"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
