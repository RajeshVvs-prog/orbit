import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, Sparkles, Loader2, Paperclip, Globe } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/src/lib/utils";
import { getStrategicAnalysis } from "@/src/services/ai";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Welcome to Orbit Intelligence. I am monitoring NASA's NeoWs feed for any potential planetary threats. How can I assist your orbital analysis today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getStrategicAnalysis(input);
      const assistantMsg: Message = { 
        role: "assistant", 
        content: response || "I'm sorry, I couldn't process that request at the moment.",
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = { 
        role: "assistant", 
        content: "System Error: Failed to connect to Orbit Intelligence Engine. Please check your connection.",
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="container mx-auto px-6 pt-32 pb-20 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-2">Orbit AI</h2>
          <p className="text-white/50">Planetary defense intelligence powered by Gemini 3.1 Pro</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl">
          <Globe className="w-4 h-4 text-brand-cyan" />
          <span className="text-xs font-bold uppercase tracking-wider">NASA Data Context Enabled</span>
        </div>
      </div>

      <div className="flex-1 glass rounded-[2.5rem] overflow-hidden flex flex-col relative">
        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-3xl",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  msg.role === "assistant" ? "bg-brand-cyan/10 text-brand-cyan" : "bg-white/10 text-white"
                )}>
                  {msg.role === "assistant" ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div className={cn(
                  "p-6 rounded-3xl text-sm leading-relaxed",
                  msg.role === "assistant" ? "bg-white/5 text-white/90" : "bg-brand-cyan text-black font-medium"
                )}>
                  <div className="markdown-body prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  <div className={cn(
                    "text-[10px] mt-4 opacity-40",
                    msg.role === "user" ? "text-right" : ""
                  )}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div className="bg-white/5 p-6 rounded-3xl flex items-center gap-3">
                <span className="text-sm text-white/50 italic">Zenith is synthesizing data...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 pt-0">
          <div className="relative glass-dark p-2 rounded-[2rem] border border-white/10 focus-within:border-brand-cyan/50 transition-colors">
            <div className="flex items-center gap-2 px-4">
              <button className="p-2 text-white/40 hover:text-white transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Zenith about market trends, competitor risks, or strategic moves..."
                className="flex-1 bg-transparent border-none outline-none py-4 text-sm text-white placeholder:text-white/30"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-3 rounded-2xl transition-all",
                  input.trim() && !isLoading ? "bg-brand-cyan text-black glow-cyan" : "bg-white/5 text-white/20"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            {["Closest asteroid today?", "What is a hazardous NEO?", "Explain orbital miss distance"].map((suggestion, i) => (
              <button 
                key={i}
                onClick={() => setInput(suggestion)}
                className="text-[10px] uppercase tracking-widest font-bold text-white/30 hover:text-brand-cyan transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
