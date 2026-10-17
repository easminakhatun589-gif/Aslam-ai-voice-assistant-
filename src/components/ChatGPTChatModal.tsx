import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Trash2, Bot, User, Sparkles, Send, Mic, Copy, Check, RotateCcw, 
  Volume2, Heart, Users, Crown, Flame, ChevronDown, Plus, MessageSquareText
} from "lucide-react";
import { CompanionMode, COMPANION_MODES, CompanionModeInfo } from "../types/modes";
import { ThemeConfig } from "../types/themes";

interface ChatMessage {
  id: string;
  sender: "user" | "zoya";
  text: string;
}

interface ChatGPTChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  assistantName: string;
  userName: string;
  currentMode: CompanionMode;
  onSelectMode: (mode: CompanionMode) => void;
  theme: ThemeConfig;
  onSendMessage: (text: string) => void;
  onClear: () => void;
  onSpeakText: (text: string) => void;
  isProcessing: boolean;
}

export default function ChatGPTChatModal({
  isOpen,
  onClose,
  messages,
  assistantName,
  userName,
  currentMode,
  onSelectMode,
  theme,
  onSendMessage,
  onClear,
  onSpeakText,
  isProcessing,
}: ChatGPTChatModalProps) {
  const [inputText, setInputText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const modeInfo = COMPANION_MODES[currentMode] || COMPANION_MODES.gf;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages, isProcessing]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderModeIcon = (iconName: string) => {
    switch (iconName) {
      case "Heart": return <Heart size={14} className="text-pink-400" />;
      case "Users": return <Users size={14} className="text-cyan-400" />;
      case "Crown": return <Crown size={14} className="text-amber-400" />;
      case "Flame": return <Flame size={14} className="text-rose-400" />;
      default: return <Sparkles size={14} />;
    }
  };

  const suggestionPrompts = [
    { label: "Tell a romantic story 💖", text: "Jaanu, mere liye ek pyari romantic kahani sunao na!" },
    { label: "Roast my day funny 🎭", text: "Aaj ka din kaisa gaya thoda mazedaar roast karke batao!" },
    { label: "Give me daily advice 💡", text: "Aaj ke din ke liye mujhe ek accha sachha advice do." },
    { label: "Sing a sweet song 🎵", text: "Ek sweet gana gao na mere liye dil se!" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col justify-between">
        
        {/* ChatGPT Style Top Header Bar */}
        <header className="w-full h-16 border-b border-white/10 bg-[#0F1117]/95 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 font-bold text-sm">
              {assistantName.charAt(0)}
            </div>

            {/* ChatGPT Model Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold text-white transition-all"
              >
                <span>{assistantName}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${modeInfo.badgeBg} ${modeInfo.badgeText} border ${modeInfo.badgeBorder} flex items-center gap-1 font-medium`}>
                  {renderModeIcon(modeInfo.iconName)}
                  {modeInfo.name}
                </span>
                <ChevronDown size={14} className="text-white/60" />
              </button>

              <AnimatePresence>
                {showModeDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute left-0 top-full mt-2 w-56 bg-[#161822] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 space-y-1"
                  >
                    {(Object.keys(COMPANION_MODES) as CompanionMode[]).map((mKey) => {
                      const m = COMPANION_MODES[mKey];
                      return (
                        <button
                          key={mKey}
                          onClick={() => {
                            onSelectMode(mKey);
                            setShowModeDropdown(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                            currentMode === mKey
                              ? "bg-white/10 text-white font-semibold"
                              : "text-white/70 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {renderModeIcon(m.iconName)}
                            <span>{m.name}</span>
                          </div>
                          <span className="text-[10px] text-white/40">{m.bengaliName}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Clear chat history?")) onClear();
                }}
                className="p-2 rounded-xl text-white/50 hover:text-red-400 hover:bg-white/10 transition-colors"
                title="Clear Chat"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Chat"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* ChatGPT Style Scrollable Chat Thread */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 max-w-3xl w-full mx-auto overscroll-contain">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500/20 to-violet-500/20 border border-pink-500/30 flex items-center justify-center shadow-2xl">
                <MessageSquareText size={32} className="text-pink-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Chat with {assistantName}
                </h2>
                <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto leading-relaxed">
                  Real-time AI conversation powered by Gemini 3.8. Switch modes anytime or type below to start chatting!
                </p>
              </div>

              {/* Quick ChatGPT Suggestion Prompt Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md pt-2">
                {suggestionPrompts.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(s.text)}
                    className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left text-xs text-white/80 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="font-semibold block mb-0.5">{s.label}</span>
                    <span className="text-[11px] text-white/40 line-clamp-1">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isUser ? "flex-row-reverse" : "flex-row"} group`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                    isUser 
                      ? "bg-violet-600 text-white border border-violet-400/40" 
                      : "bg-pink-600 text-white border border-pink-400/40"
                  }`}>
                    {isUser ? (userName ? userName.charAt(0).toUpperCase() : "U") : assistantName.charAt(0)}
                  </div>

                  {/* Message Body & Actions */}
                  <div className={`max-w-[85%] sm:max-w-[78%] space-y-1 ${isUser ? "items-end text-right" : "items-start text-left"}`}>
                    <div className="flex items-center gap-2 text-[10px] text-white/40 px-1 font-mono uppercase">
                      <span>{isUser ? userName || "You" : assistantName}</span>
                      {!isUser && (
                        <span className={`px-1.5 py-0.2 rounded ${modeInfo.badgeBg} ${modeInfo.badgeText} text-[9px]`}>
                          {modeInfo.name}
                        </span>
                      )}
                    </div>

                    <div className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-lg ${
                      isUser
                        ? "bg-violet-600/90 text-white rounded-tr-none border border-violet-500/30"
                        : "bg-[#1B1E2B] text-white/95 rounded-tl-none border border-white/10"
                    }`}>
                      <p className="whitespace-pre-wrap select-text leading-relaxed">{msg.text}</p>
                    </div>

                    {/* Message Actions Bar (ChatGPT style) */}
                    <div className={`flex items-center gap-2 px-1 pt-1 text-white/40 text-xs opacity-80 group-hover:opacity-100 transition-opacity ${isUser ? "justify-end" : "justify-start"}`}>
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="p-1 hover:text-white transition-colors"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>

                      {!isUser && (
                        <button
                          onClick={() => onSpeakText(msg.text)}
                          className="p-1 hover:text-pink-400 transition-colors"
                          title="Speak Audio"
                        >
                          <Volume2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {isProcessing && (
            <div className="flex gap-3 items-center text-xs text-pink-400 font-medium">
              <div className="w-8 h-8 rounded-full bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Sparkles size={14} className="animate-spin" />
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#1B1E2B] border border-white/10">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                <span>{assistantName} is typing...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ChatGPT Style Prompt Bar */}
        <footer className="w-full border-t border-white/10 bg-[#0F1117] p-4 shrink-0 z-20">
          <div className="max-w-3xl mx-auto space-y-2">
            
            <form onSubmit={handleSubmit} className="relative flex items-center bg-[#1B1E2B] border border-white/15 rounded-full p-2 pl-5 shadow-2xl focus-within:border-pink-500/50 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${assistantName} (${modeInfo.name})...`}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 text-xs sm:text-sm"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 ml-2"
                title="Send Message"
              >
                <Send size={16} />
              </button>
            </form>

            <p className="text-[10px] text-center text-white/30">
              {assistantName} AI can make mistakes. Verify important info.
            </p>
          </div>
        </footer>

      </div>
    </AnimatePresence>
  );
}
