import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, Bot, User, Sparkles, MessageSquare } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "zoya";
  text: string;
}

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  assistantName: string;
  userName: string;
  onClear: () => void;
}

export default function ChatHistoryModal({
  isOpen,
  onClose,
  messages,
  assistantName,
  userName,
  onClear,
}: ChatHistoryModalProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-lg bg-[#141620] border border-white/10 rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col h-[85dvh] sm:h-[80dvh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="shrink-0 px-5 py-4 border-b border-white/10 bg-[#181A24] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white tracking-wide">
                  Conversation Transcript
                </h3>
                <p className="text-[11px] text-white/50">
                  {messages.length} {messages.length === 1 ? "turn" : "turns"} exchanged
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Clear all conversation history?")) {
                      onClear();
                    }
                  }}
                  className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-white/5 transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Sparkles size={22} className="text-pink-400/60" />
                </div>
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs max-w-xs text-white/30">
                  Start speaking or tap the keyboard icon to type a message to {assistantName}.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 mt-0.5 border border-pink-500/30">
                        <Bot size={14} />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isUser
                          ? "bg-violet-600/80 text-white rounded-br-none border border-violet-500/30"
                          : "bg-white/10 text-white/90 rounded-bl-none border border-white/10"
                      }`}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-wider mb-1 opacity-60">
                        {isUser ? userName || "You" : assistantName}
                      </div>
                      <p className="whitespace-pre-wrap select-text">{msg.text}</p>
                    </div>
                    {isUser && (
                      <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 mt-0.5 border border-violet-500/30">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
