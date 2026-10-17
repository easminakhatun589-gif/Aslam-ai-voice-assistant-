import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, Users, Crown, Flame, Palette, Sparkles, Check, ChevronRight } from "lucide-react";
import { CompanionMode, COMPANION_MODES, CompanionModeInfo } from "../types/modes";
import { ThemeId, APP_THEMES, ThemeConfig } from "../types/themes";

interface ThemeAndModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: CompanionMode;
  onSelectMode: (mode: CompanionMode) => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
}

export default function ThemeAndModeSelector({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
  currentTheme,
  onSelectTheme,
}: ThemeAndModeSelectorProps) {
  const [activeTab, setActiveTab] = useState<"modes" | "themes">("modes");

  if (!isOpen) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Heart": return <Heart size={18} className="text-pink-400" />;
      case "Users": return <Users size={18} className="text-cyan-400" />;
      case "Crown": return <Crown size={18} className="text-amber-400" />;
      case "Flame": return <Flame size={18} className="text-rose-400" />;
      default: return <Sparkles size={18} />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/75 backdrop-blur-md">
        {/* Backdrop Dismiss */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Bottom Sheet Drawer */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="relative w-full sm:max-w-md bg-[#12141D] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
        >
          {/* Drag Handle Bar for Touch Feel */}
          <div className="w-full flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 py-3 flex items-center justify-between border-b border-white/10">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-pink-400" />
                Customize Personality & Theme
              </h2>
              <p className="text-[11px] text-white/50">
                4 Modes & 5 High-Level 3D Themes
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Segmented Tab Controls */}
          <div className="px-6 pt-4 pb-2">
            <div className="grid grid-cols-2 p-1 bg-white/5 border border-white/10 rounded-2xl text-xs font-medium">
              <button
                onClick={() => setActiveTab("modes")}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === "modes"
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20 font-semibold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Heart size={14} />
                4 Modes (মোডসমূহ)
              </button>
              <button
                onClick={() => setActiveTab("themes")}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === "themes"
                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20 font-semibold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Palette size={14} />
                3D Themes (থিমসমূহ)
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 pt-3 overflow-y-auto space-y-3 flex-1">
            {activeTab === "modes" ? (
              <div className="space-y-3">
                {(Object.keys(COMPANION_MODES) as CompanionMode[]).map((modeKey) => {
                  const m = COMPANION_MODES[modeKey];
                  const isSelected = currentMode === modeKey;
                  return (
                    <button
                      key={modeKey}
                      onClick={() => {
                        onSelectMode(modeKey);
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                        isSelected
                          ? `bg-white/10 border-pink-500/60 shadow-lg shadow-pink-500/10`
                          : `bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.06]`
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
                          style={{ backgroundColor: `${m.color}20` }}
                        >
                          {renderIcon(m.iconName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-white">
                              {m.name}
                            </h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${m.badgeBg} ${m.badgeText} border ${m.badgeBorder}`}>
                              {m.bengaliName}
                            </span>
                          </div>
                          <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                            {m.tagline}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white">
                            <Check size={14} />
                          </div>
                        ) : (
                          <ChevronRight size={18} className="text-white/30 group-hover:text-white/70 transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {(Object.keys(APP_THEMES) as ThemeId[]).map((themeKey) => {
                  const t = APP_THEMES[themeKey];
                  const isSelected = currentTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      onClick={() => {
                        onSelectTheme(themeKey);
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                        isSelected
                          ? `bg-white/10 border-violet-500/60 shadow-lg shadow-violet-500/10`
                          : `bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.06]`
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Theme Color Palette Preview Dots */}
                        <div className="flex items-center -space-x-2 shrink-0">
                          <div
                            className="w-7 h-7 rounded-full border border-white/20 shadow-md"
                            style={{ backgroundColor: t.primaryColor }}
                          />
                          <div
                            className="w-7 h-7 rounded-full border border-white/20 shadow-md"
                            style={{ backgroundColor: t.secondaryColor }}
                          />
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            {t.name}
                            <span className="text-[10px] text-white/50 font-normal">
                              ({t.bengaliName})
                            </span>
                          </h3>
                          <p className="text-xs text-white/50 mt-0.5">
                            Real-time 3D lighting & UI theme
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-white">
                            <Check size={14} />
                          </div>
                        ) : (
                          <ChevronRight size={18} className="text-white/30 group-hover:text-white/70 transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
