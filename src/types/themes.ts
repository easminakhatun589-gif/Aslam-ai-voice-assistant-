export type ThemeId = "cyberpunk" | "royal_gold" | "midnight_violet" | "emerald_matrix" | "sunset_crimson";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bengaliName: string;
  primaryColor: string;       // Hex for 3D visualizer
  secondaryColor: string;     // Hex for 3D particles/rings
  accentGlow: string;         // Tailwind glow shadow or color
  bgGradient: string;         // Background CSS gradient
  cardBg: string;             // Glass card background style
  borderStyle: string;        // Hairline border style
  headerText: string;         // Title accent text class
  badgeStyle: string;         // Badge styling
  visualizerCore: string;     // Core 3D glow color
}

export const APP_THEMES: Record<ThemeId, ThemeConfig> = {
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    bengaliName: "সাইবারপাংক নিয়ন",
    primaryColor: "#EC4899",
    secondaryColor: "#06B6D4",
    accentGlow: "rgba(236, 72, 153, 0.5)",
    bgGradient: "from-[#0A0C10] via-[#0F121C] to-[#0A0C10]",
    cardBg: "bg-[#141722]/85 backdrop-blur-xl",
    borderStyle: "border-pink-500/20 hover:border-pink-500/40",
    headerText: "from-pink-400 via-violet-400 to-cyan-400",
    badgeStyle: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    visualizerCore: "#EC4899",
  },
  royal_gold: {
    id: "royal_gold",
    name: "Royal Gold & Luxury",
    bengaliName: "রয়েল গোল্ড",
    primaryColor: "#F59E0B",
    secondaryColor: "#FDE68A",
    accentGlow: "rgba(245, 158, 11, 0.5)",
    bgGradient: "from-[#0D0A05] via-[#1A140B] to-[#0D0A05]",
    cardBg: "bg-[#1B160E]/85 backdrop-blur-xl",
    borderStyle: "border-amber-500/20 hover:border-amber-500/40",
    headerText: "from-amber-300 via-yellow-400 to-amber-500",
    badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    visualizerCore: "#F59E0B",
  },
  midnight_violet: {
    id: "midnight_violet",
    name: "Midnight OLED Violet",
    bengaliName: "মিডনাইট ভায়োলেট",
    primaryColor: "#A855F7",
    secondaryColor: "#6366F1",
    accentGlow: "rgba(168, 85, 247, 0.5)",
    bgGradient: "from-[#05050A] via-[#0C0B18] to-[#05050A]",
    cardBg: "bg-[#111024]/85 backdrop-blur-xl",
    borderStyle: "border-purple-500/20 hover:border-purple-500/40",
    headerText: "from-purple-400 via-indigo-400 to-violet-400",
    badgeStyle: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    visualizerCore: "#A855F7",
  },
  emerald_matrix: {
    id: "emerald_matrix",
    name: "Emerald Cyber Mint",
    bengaliName: "ইমারেল্ড মিন্ট",
    primaryColor: "#10B981",
    secondaryColor: "#34D399",
    accentGlow: "rgba(16, 185, 129, 0.5)",
    bgGradient: "from-[#040C09] via-[#091A14] to-[#040C09]",
    cardBg: "bg-[#0C221B]/85 backdrop-blur-xl",
    borderStyle: "border-emerald-500/20 hover:border-emerald-500/40",
    headerText: "from-emerald-400 via-teal-300 to-cyan-400",
    badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    visualizerCore: "#10B981",
  },
  sunset_crimson: {
    id: "sunset_crimson",
    name: "Sunset Scarlet Dream",
    bengaliName: "সানসেট ক্রিমসন",
    primaryColor: "#F43F5E",
    secondaryColor: "#FB923C",
    accentGlow: "rgba(244, 63, 94, 0.5)",
    bgGradient: "from-[#0E0507] via-[#1E0B10] to-[#0E0507]",
    cardBg: "bg-[#210D12]/85 backdrop-blur-xl",
    borderStyle: "border-rose-500/20 hover:border-rose-500/40",
    headerText: "from-rose-400 via-orange-400 to-amber-400",
    badgeStyle: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    visualizerCore: "#F43F5E",
  },
};
