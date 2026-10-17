import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Gamepad2, Smartphone, Globe, Play, ExternalLink, Sparkles, Search, MessageSquare 
} from "lucide-react";

interface VoiceAppsLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (command: string) => void;
  userName: string;
}

export default function VoiceAppsLauncherModal({
  isOpen,
  onClose,
  onExecuteCommand,
  userName,
}: VoiceAppsLauncherModalProps) {
  const [activeCategory, setActiveCategory] = useState<"games" | "apps" | "web">("games");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const gameItems = [
    { name: "Free Fire / FF", voiceCmd: "Play Free Fire", category: "Action Game", icon: "🔥", color: "from-orange-500 to-red-600" },
    { name: "PUBG Mobile / BGMI", voiceCmd: "Play PUBG", category: "Battle Royale", icon: "🪖", color: "from-amber-500 to-yellow-600" },
    { name: "Subway Surfers", voiceCmd: "Play Subway Surfers", category: "Endless Runner", icon: "🏃‍♂️", color: "from-cyan-500 to-blue-600" },
    { name: "Ludo King", voiceCmd: "Play Ludo", category: "Board Game", icon: "🎲", color: "from-emerald-500 to-teal-600" },
    { name: "Chess.com", voiceCmd: "Play Chess", category: "Strategy", icon: "♟️", color: "from-purple-500 to-indigo-600" },
    { name: "Google Snake", voiceCmd: "Play Snake Game", category: "Retro Arcade", icon: "🐍", color: "from-green-500 to-emerald-600" },
    { name: "Tic Tac Toe", voiceCmd: "Play Tic Tac Toe", category: "Puzzle Game", icon: "❌⭕", color: "from-pink-500 to-rose-600" },
    { name: "Roblox", voiceCmd: "Play Roblox", category: "3D Multiplayer", icon: "🧱", color: "from-red-500 to-pink-600" },
    { name: "Minecraft", voiceCmd: "Play Minecraft", category: "Sandbox", icon: "⛏️", color: "from-amber-600 to-amber-800" },
  ];

  const appItems = [
    { name: "WhatsApp Web", voiceCmd: "Open WhatsApp", category: "Messaging", icon: "💬", color: "from-emerald-500 to-green-600" },
    { name: "Facebook", voiceCmd: "Open Facebook", category: "Social Network", icon: "📘", color: "from-blue-600 to-indigo-700" },
    { name: "Instagram", voiceCmd: "Open Instagram", category: "Photos & Reels", icon: "📸", color: "from-pink-500 to-purple-600" },
    { name: "TikTok", voiceCmd: "Open TikTok", category: "Short Videos", icon: "🎵", color: "from-cyan-400 to-pink-500" },
    { name: "ChatGPT", voiceCmd: "Open ChatGPT", category: "AI Assistant", icon: "🤖", color: "from-teal-500 to-cyan-600" },
    { name: "Google Play Store", voiceCmd: "Open Play Store", category: "App Market", icon: "🏬", color: "from-blue-500 to-cyan-500" },
    { name: "Google Gemini", voiceCmd: "Open Gemini", category: "AI Intelligence", icon: "✨", color: "from-indigo-500 to-purple-600" },
    { name: "Calculator", voiceCmd: "Open Calculator", category: "Utility", icon: "🧮", color: "from-amber-500 to-orange-500" },
    { name: "Camera Test", voiceCmd: "Open Camera", category: "Hardware Test", icon: "📷", color: "from-rose-500 to-red-500" },
  ];

  const webItems = [
    { name: "YouTube", voiceCmd: "Open YouTube", category: "Video Streaming", icon: "🎬", color: "from-red-600 to-rose-700" },
    { name: "Spotify Music", voiceCmd: "Search Arijit Singh on Spotify", category: "Audio Stream", icon: "🎧", color: "from-emerald-500 to-green-600" },
    { name: "Google Search", voiceCmd: "Open Google", category: "Search Engine", icon: "🔍", color: "from-blue-500 to-cyan-500" },
    { name: "Wikipedia", voiceCmd: "Open Wikipedia", category: "Encyclopedia", icon: "📚", color: "from-slate-500 to-zinc-600" },
    { name: "GitHub", voiceCmd: "Open GitHub", category: "Developer Code", icon: "🐙", color: "from-purple-600 to-indigo-800" },
  ];

  const getFilteredItems = () => {
    let list = activeCategory === "games" ? gameItems : activeCategory === "apps" ? appItems : webItems;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || i.voiceCmd.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    return list;
  };

  const itemsToDisplay = getFilteredItems();

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-xl bg-[#12141D] border border-white/10 rounded-t-[32px] sm:rounded-[28px] shadow-2xl flex flex-col h-[85dvh] sm:h-[80dvh] overflow-hidden z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="shrink-0 px-6 py-4 border-b border-white/10 bg-[#161824] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/20 font-bold">
                <Gamepad2 size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  Voice Commands Hub
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    Voice Launch 🎤
                  </span>
                </h2>
                <p className="text-[11px] text-white/50">
                  Speak or tap to launch Games, Apps & Websites
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search & Category Tabs */}
          <div className="p-4 sm:p-6 pb-2 space-y-3 shrink-0">
            {/* Search Bar */}
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2">
              <Search size={16} className="text-white/40 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games, apps, or voice commands..."
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder:text-white/40"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-white/40 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Segmented Tabs */}
            <div className="grid grid-cols-3 p-1 bg-white/5 border border-white/10 rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setActiveCategory("games")}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeCategory === "games"
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Gamepad2 size={15} />
                Games (গেমস)
              </button>
              <button
                onClick={() => setActiveCategory("apps")}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeCategory === "apps"
                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Smartphone size={15} />
                Apps (অ্যাপস)
              </button>
              <button
                onClick={() => setActiveCategory("web")}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeCategory === "web"
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Globe size={15} />
                Web (ওয়েব)
              </button>
            </div>
          </div>

          {/* Cards Grid List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 space-y-3 overscroll-contain">
            {itemsToDisplay.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-white/40">
                <p className="text-sm font-medium">No voice commands found for "{searchQuery}"</p>
                <p className="text-xs text-white/30 mt-1">Try searching for Free Fire, WhatsApp, or YouTube.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {itemsToDisplay.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-lg shadow-md shrink-0`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-white">
                          {item.name}
                        </h3>
                        <p className="text-[10px] text-pink-400/90 font-mono mt-0.5 flex items-center gap-1">
                          <span>🗣️ Say: "{item.voiceCmd}"</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onExecuteCommand(item.voiceCmd);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-pink-500 text-white text-xs font-semibold flex items-center gap-1 transition-all shrink-0 active:scale-95 shadow-md"
                      title="Run Voice Command"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Launch</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
