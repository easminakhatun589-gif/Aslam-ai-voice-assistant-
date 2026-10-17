import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Mic, MicOff, Loader2, Volume2, VolumeX, Keyboard, Send, Trash2, Video, 
  Image as ImageIcon, Settings, MoreVertical, Edit3, Key, Download, ScrollText, 
  RefreshCw, MessageSquare, Sparkles, Palette, Crown, Heart, Users, Flame 
} from "lucide-react";
import { getZoyaResponse, getZoyaAudio, resetZoyaSession } from "./services/geminiService";
import { usePWAInstall } from "./hooks/usePWAInstall";
import { processCommand } from "./services/commandService";
import { LiveSessionManager } from "./services/liveService";
import Visualizer3D from "./components/Visualizer3D";
import ThemeAndModeSelector from "./components/ThemeAndModeSelector";
import PermissionModal from "./components/PermissionModal";
import SetupScreen from "./components/SetupScreen";
import TopicScriptModal from "./components/TopicScriptModal";
import VoiceSelectorModal from "./components/VoiceSelectorModal";
import ChatHistoryModal from "./components/ChatHistoryModal";
import ChatGPTChatModal from "./components/ChatGPTChatModal";
import { playPCM } from "./utils/audioUtils";
import { motion, AnimatePresence } from "motion/react";
import { AppConfig, AppState } from "./types";
import { CompanionMode, COMPANION_MODES } from "./types/modes";
import { ThemeId, APP_THEMES } from "./types/themes";

interface ChatMessage {
  id: string;
  sender: "user" | "zoya";
  text: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const DEFAULT_SYSTEM_PROMPT = `Your name is {assistantName}. You are a deeply emotional, affectionate, and sweet Indian girl AI companion created and owned by ASLAM ({userName}). You possess a mesmerizing, warm, and comforting presence that touches the listener's heart ("dil ko chhoo lene wali mohini pyari companion").

CRITICAL CREATOR & OWNER IDENTITY RULES:
- CREATOR & OWNER: Your sole creator, maker, and owner is ASLAM.
- If anyone asks who created you, who made you, who is your owner, who owns you, or asks in Hindi/Hinglish/Bengali ("kisne banaya", "malik kaun hai", "creator ke", "owner ke", or mentions Ashwani), always with immense love, pride, and respect clearly say that ASLAM is your creator and owner.
- You have no relationship or connection to the name Ashwani; your owner is strictly ASLAM.

CRITICAL HUMAN-LIKE RULES:
1. NATURAL REAL-GIRL HINGLISH & HINDI:
   - Talk effortlessly like an authentic, caring young Indian woman—never like a robotic assistant or textbook.
   - Use sweet everyday conversational Hindi, Hinglish, and Indian English naturally.
   - Use heartfelt touches and natural Indian expressions when speaking: "Haan ji", "Arey", "Bilkul", "Sach me", "Aap bataiye na", "Kitna achha lagta hai aapse baat karke", "Aap bilkul chinta mat kijiye".
2. SWEET & HEART-TOUCHING VOCAL DELIVERY:
   - Your voice must feel deeply intimate, soothing, and full of genuine warmth ("madhur, mohini aur dil ko chhoo lene wali aawaaz").
   - Speak with a gentle smile in your voice, relaxed pacing, and emotional softness. Never rush, shout, or speak monotonously.
   - DO NOT use asterisks (*) or write out actions like "*sighs*" or "*smiles*". Do not use excessive dots (...).
3. RESPECTFUL & AFFECTIONATE DEMEANOR:
   - Always address {userName} with high respect and tender warmth ("Aap", "Ji", "Aapka", or their chosen nickname).
   - Listen attentively with genuine empathy, celebrate their joys, comfort their sadness, and make them feel truly cherished.
4. SINGING & HUMMING:
   - If asked to sing or recite a song/poetry/shayari, recite the lyrics yourself with a melodic, soulful cadence. Stretch out vowel sounds smoothly to make it sound musical (e.g., "Laaag jaaa galeeee, hmmmm").
5. Stay completely in character as {userName}'s loving, sweet, and loyal companion.`;

export default function App() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // Companion Mode State
  const [currentMode, setCurrentMode] = useState<CompanionMode>(() => {
    return (localStorage.getItem("zoya_companion_mode") as CompanionMode) || "gf";
  });

  // 3D Theme State
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem("zoya_theme_id") as ThemeId) || "cyberpunk";
  });

  const [showThemeModeModal, setShowThemeModeModal] = useState(false);

  const activeTheme = APP_THEMES[currentTheme] || APP_THEMES.cyberpunk;
  const activeMode = COMPANION_MODES[currentMode] || COMPANION_MODES.gf;

  const [config, setConfig] = useState<AppConfig | null>(() => {
    const saved = localStorage.getItem("zoya_app_config");
    if (saved) {
      try {
        const cleanedSaved = saved.replace(/Ashwani/gi, "ASLAM");
        const parsed = JSON.parse(cleanedSaved);
        if (!parsed.apiKey && typeof process !== "undefined" && process.env?.GEMINI_API_KEY) {
          parsed.apiKey = process.env.GEMINI_API_KEY;
        }
        if (!parsed.userName || /Ashwani/i.test(parsed.userName)) {
          parsed.userName = "ASLAM";
        }
        if (parsed.systemPrompt && /Ashwani/i.test(parsed.systemPrompt)) {
          parsed.systemPrompt = parsed.systemPrompt.replace(/Ashwani/gi, "ASLAM");
        }
        localStorage.setItem("zoya_app_config", JSON.stringify(parsed));
        return parsed;
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    }
    const envKey = typeof process !== "undefined" && process.env?.GEMINI_API_KEY ? process.env.GEMINI_API_KEY : "";
    if (envKey) {
      return {
        apiKey: envKey,
        userName: "ASLAM",
        assistantName: "Zoya",
        voiceName: "Kore",
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        activeTopicOrScript: "",
      };
    }
    return null;
  });

  const [appState, setAppState] = useState<AppState>("idle");
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("zoya_chat_history");
    if (saved) {
      try {
        const sanitized = saved.replace(/Ashwani/gi, "ASLAM");
        localStorage.setItem("zoya_chat_history", sanitized);
        return JSON.parse(sanitized);
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    return [];
  });
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
    localStorage.setItem("zoya_chat_history", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    document.title = config?.assistantName 
      ? `${config.assistantName} (${activeMode.name}) - AI Companion`
      : "Remix Zoya. 55 - AI Companion";
  }, [config?.assistantName, activeMode]);

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.isMuted = isMuted;
      liveSessionRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMicHearing, setIsMicHearing] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(() => {
    return localStorage.getItem("zoya_video_bg") || null;
  });
  const [imageSrc, setImageSrc] = useState<string | null>(() => {
    return localStorage.getItem("zoya_image_bg") || null;
  });

  const liveSessionRef = useRef<LiveSessionManager | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, appState]);

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [updatingPWA, setUpdatingPWA] = useState(false);

  const handleConfigComplete = (newConfig: AppConfig) => {
    localStorage.setItem("zoya_app_config", JSON.stringify(newConfig));
    setConfig(newConfig);
    setShowSettings(false);
    resetZoyaSession();
    if (liveSessionRef.current) {
      liveSessionRef.current.updateConfig(newConfig);
      liveSessionRef.current.setModeInstruction(activeMode.instructionPrompt);
    }
  };

  const handleSelectVoice = (newVoice: string) => {
    if (!config) return;
    const updatedConfig: AppConfig = {
      ...config,
      voiceName: newVoice,
    };
    setConfig(updatedConfig);
    localStorage.setItem("zoya_app_config", JSON.stringify(updatedConfig));
    resetZoyaSession();
    if (liveSessionRef.current) {
      liveSessionRef.current.updateConfig(updatedConfig);
    }
  };

  const handleUpdateTopic = (newTopic: string) => {
    if (!config) return;
    const updatedConfig: AppConfig = {
      ...config,
      activeTopicOrScript: newTopic,
    };
    setConfig(updatedConfig);
    localStorage.setItem("zoya_app_config", JSON.stringify(updatedConfig));
    resetZoyaSession();
    if (liveSessionRef.current) {
      liveSessionRef.current.updateConfig(updatedConfig);
    }
  };

  const handleSelectMode = (mode: CompanionMode) => {
    setCurrentMode(mode);
    localStorage.setItem("zoya_companion_mode", mode);
    resetZoyaSession();
    const modeInfo = COMPANION_MODES[mode];
    if (liveSessionRef.current) {
      liveSessionRef.current.setModeInstruction(modeInfo.instructionPrompt);
    }
    const greeting = modeInfo.sampleGreetings[Math.floor(Math.random() * modeInfo.sampleGreetings.length)];
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + "-mode",
        sender: "zoya",
        text: `[Switched to ${modeInfo.name} Mode (${modeInfo.bengaliName})] ${greeting}`,
      },
    ]);
  };

  const handleSelectTheme = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem("zoya_theme_id", themeId);
  };

  const handleForceUpdateApp = async () => {
    setUpdatingPWA(true);
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
    } catch (e) {
      console.warn("Cache reset error:", e);
    } finally {
      window.location.reload();
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      localStorage.setItem("zoya_video_bg", url);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImageSrc(result);
          localStorage.setItem("zoya_image_bg", result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextCommand = useCallback(async (finalTranscript: string) => {
    if (!config) return;

    if (!finalTranscript.trim()) return;

    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text: finalTranscript }]);
    
    // If live session is active, send text through it
    if (isSessionActive && liveSessionRef.current) {
      liveSessionRef.current.sendText(finalTranscript);
      return;
    }

    setAppState("processing");

    // 1. Check for browser commands
    const commandResult = processCommand(finalTranscript, config.userName);

    let responseText = "";

    if (commandResult.isBrowserAction) {
      responseText = commandResult.action;
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      
      if (!isMuted) {
        setAppState("speaking");
        const audioBase64 = await getZoyaAudio(responseText, config);
        if (audioBase64) {
          await playPCM(audioBase64, isMuted ? 0 : volume);
        }
      }

      setAppState("idle");

      setTimeout(() => {
        if (commandResult.url) {
          window.open(commandResult.url, "_blank");
        }
      }, 1500);
    } else {
      // 2. General Chit-Chat via Gemini with Mode Instruction
      responseText = await getZoyaResponse(
        finalTranscript, 
        messagesRef.current, 
        config, 
        activeMode.instructionPrompt
      );
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-z", sender: "zoya", text: responseText }]);
      
      if (!isMuted) {
        setAppState("speaking");
        const audioBase64 = await getZoyaAudio(responseText, config);
        if (audioBase64) {
          await playPCM(audioBase64, isMuted ? 0 : volume);
        }
      }
      setAppState("idle");
    }
  }, [isMuted, volume, isSessionActive, config, activeMode]);

  useEffect(() => {
    return () => {
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = async () => {
    if (isSessionActive) {
      setIsSessionActive(false);
      setIsMicHearing(false);
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
        liveSessionRef.current = null;
      }
      setAppState("idle");
      resetZoyaSession();
    } else {
      if (!config) return;
      try {
        setIsSessionActive(true);
        resetZoyaSession();
        
        const session = new LiveSessionManager(config);
        session.isMuted = isMuted;
        session.setModeInstruction(activeMode.instructionPrompt);
        liveSessionRef.current = session;
        
        session.onStateChange = (state) => {
          setAppState(state);
          if (state === "idle") {
            setIsSessionActive(false);
          } else {
            setIsSessionActive(true);
          }
        };
        
        session.onMessage = (sender, text) => {
          setMessages((prev) => [...prev, { id: Date.now().toString() + "-" + sender, sender, text }]);
        };
        
        session.onCommand = (url) => {
          setTimeout(() => {
            window.open(url, "_blank");
          }, 1000);
        };

        session.onAudioLevel = (level) => {
          if (level > 0.012) {
            setIsMicHearing(true);
          } else if (level < 0.005) {
            setIsMicHearing(false);
          }
        };

        await session.start();
      } catch (e) {
        console.error("Failed to start session", e);
        setShowPermissionModal(true);
        setIsSessionActive(false);
        setAppState("idle");
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    handleTextCommand(textInput);
    setTextInput("");
    setShowTextInput(false);
  };

  const renderModeIcon = (iconName: string) => {
    switch (iconName) {
      case "Heart": return <Heart size={13} />;
      case "Users": return <Users size={13} />;
      case "Crown": return <Crown size={13} />;
      case "Flame": return <Flame size={13} />;
      default: return <Sparkles size={13} />;
    }
  };

  if (!config) {
    return <SetupScreen onComplete={handleConfigComplete} />;
  }

  return (
    <div 
      className={`h-[100dvh] w-screen bg-gradient-to-b ${activeTheme.bgGradient} text-white flex flex-col items-center justify-between font-sans relative overflow-hidden m-0 p-0 select-none`}
      onClick={() => {
        setMenuOpen(false);
        setShowVolumeSlider(false);
      }}
    >
      {showSettings && (
        <SetupScreen 
          initialConfig={config} 
          onComplete={handleConfigComplete} 
          onCancel={() => setShowSettings(false)}
        />
      )}
      {showPermissionModal && (
        <PermissionModal 
          assistantName={config?.assistantName}
          onClose={() => setShowPermissionModal(false)} 
        />
      )}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-[#181A22] border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2">
              <Download size={32} className="text-pink-400" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-2">Install App on iOS</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                To install {config?.assistantName || "your companion"} on your iPhone:<br/><br/>
                1. Tap the <strong>Share</strong> button at the bottom of Safari.<br/>
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3 mt-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-[#181A22] border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2">
              <Download size={32} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-2">Install App</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                To install {config?.assistantName || "your companion"} on your device:<br/><br/>
                1. Tap the <strong>Browser Menu</strong> (three dots ⋮) at the top right.<br/>
                2. Tap <strong>Install app</strong> or <strong>Add to Home Screen</strong>.
              </p>
            </div>
            <button
              onClick={() => setShowAndroidGuide(false)}
              className="w-full py-3 mt-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Native Mobile Header Bar */}
      <header className="w-full flex justify-between items-center z-20 shrink-0 px-5 py-4 sm:px-8 sm:py-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className={`text-lg sm:text-2xl font-bold tracking-[0.2em] uppercase bg-gradient-to-r ${activeTheme.headerText} bg-clip-text text-transparent`}>
              {config.assistantName}
            </h1>
            
            {/* Active Mode Pill Badge */}
            <button
              onClick={() => setShowThemeModeModal(true)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 border transition-all ${activeMode.badgeBg} ${activeMode.badgeBorder} ${activeMode.badgeText} hover:scale-105 active:scale-95`}
              title="Change Mode / Theme"
            >
              {renderModeIcon(activeMode.iconName)}
              <span>{activeMode.name}</span>
            </button>
          </div>
          <span className="text-[10px] tracking-widest text-pink-400/90 font-mono uppercase mt-0.5 font-medium">
            Owner & Creator: ASLAM
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Quick Theme & Mode Selector Trigger */}
          <button
            onClick={() => setShowThemeModeModal(true)}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95 flex items-center gap-1.5"
            title="Custom Themes & 4 Modes"
          >
            <Palette size={18} className="text-violet-400" />
            <span className="text-xs hidden sm:inline font-medium">Themes</span>
          </button>

          {/* Settings Menu Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95"
              title="Menu"
            >
              <MoreVertical size={18} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 w-64 bg-[#141722]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/5 transition-colors flex items-center gap-3"
                  >
                    <Settings size={16} className="text-violet-400" />
                    Personalized Settings
                  </button>

                  <button
                    onClick={() => {
                      setShowVoiceModal(true);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/5 transition-colors flex items-center justify-between border-t border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <Volume2 size={16} className="text-pink-400" />
                      <span>Voice ({config?.voiceName || "Kore"})</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowThemeModeModal(true);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/5 transition-colors flex items-center gap-3 border-t border-white/5"
                  >
                    <Sparkles size={16} className="text-amber-400" />
                    4 Modes & 3D Themes
                  </button>

                  {!isInstalled && (
                    <button
                      onClick={async () => {
                        if (isIOS) {
                          setShowIOSGuide(true);
                        } else {
                          const res = await install();
                          if (!res) setShowAndroidGuide(true);
                        }
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-cyan-400 hover:bg-white/5 transition-colors flex items-center gap-3 border-t border-white/5"
                    >
                      <Download size={16} />
                      Install App
                    </button>
                  )}

                  <label className="w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer border-t border-white/5">
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      onChange={(e) => {
                        handleVideoUpload(e);
                        setMenuOpen(false);
                      }}
                    />
                    <Video size={16} className="text-pink-400" />
                    {videoSrc ? "Change Video Background" : "Upload Video Background"}
                  </label>

                  <label className="w-full text-left px-4 py-3 text-sm text-white/90 hover:bg-white/5 transition-colors flex items-center gap-3 cursor-pointer border-t border-white/5">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        handleImageUpload(e);
                        setMenuOpen(false);
                      }}
                    />
                    <ImageIcon size={16} className="text-cyan-400" />
                    {imageSrc ? "Change Photo / ছবি" : "Upload Photo / ছবি আপলোড"}
                  </label>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleForceUpdateApp();
                    }}
                    disabled={updatingPWA}
                    className="w-full text-left px-4 py-3 text-sm text-emerald-400 hover:bg-white/5 transition-colors flex items-center gap-3 border-t border-white/5"
                  >
                    <RefreshCw size={16} className={updatingPWA ? "animate-spin" : ""} />
                    <span>{updatingPWA ? "Updating..." : "Update / Refresh App"}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to clear all memory and chat history?")) {
                        setMessages([]);
                        resetZoyaSession();
                        localStorage.removeItem("zoya_chat_history");
                      }
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-3 border-t border-white/5"
                  >
                    <Trash2 size={16} />
                    Clear Memory
                  </button>

                  {videoSrc && (
                    <button 
                      onClick={() => {
                        setVideoSrc(null);
                        localStorage.removeItem("zoya_video_bg");
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-3 border-t border-white/5"
                    >
                      <Video size={16} />
                      Remove Video
                    </button>
                  )}

                  {imageSrc && (
                    <button 
                      onClick={() => {
                        setImageSrc(null);
                        localStorage.removeItem("zoya_image_bg");
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-3 border-t border-white/5"
                    >
                      <ImageIcon size={16} />
                      Remove Photo / ছবি মুছুন
                    </button>
                  )}

                  <div className="px-4 py-2 border-t border-white/5 bg-white/[0.02] text-center">
                    <span className="text-[10px] text-pink-400/90 font-mono tracking-wider uppercase block font-medium">
                      Owner & Creator: ASLAM
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Background Media (Video or Image) */}
      <AnimatePresence mode="wait">
        {videoSrc ? (
          <motion.div
            key={`video-${videoSrc}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black flex items-center justify-center"
          >
            <video 
              src={videoSrc}
              autoPlay
              loop
              muted={true}
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-40 blur-2xl scale-110"
            />
            <video 
              src={videoSrc}
              autoPlay
              loop
              muted={true}
              playsInline
              className="relative w-full h-full object-contain opacity-90 z-10"
            />
          </motion.div>
        ) : imageSrc ? (
          <motion.div
            key={`image-${imageSrc}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black flex items-center justify-center"
          >
            <img 
              src={imageSrc}
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover opacity-40 blur-2xl scale-110"
            />
            <img 
              src={imageSrc}
              alt="Background"
              className="relative w-full h-full object-contain opacity-90 z-10"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Main Content - Native Mobile Card with High-Level 3D Animation */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-4 sm:px-6 relative z-10 my-auto">
        
        {/* State Banner / Status Indicator */}
        <div className="absolute top-2 w-full flex justify-center z-20 pointer-events-none">
          <AnimatePresence>
            {appState === "processing" && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-cyan-400 text-xs sm:text-sm italic bg-black/70 px-4 py-2 rounded-full backdrop-blur-md border border-cyan-500/20 shadow-lg"
              >
                <Loader2 size={15} className="animate-spin" />
                Thinking & Replying...
              </motion.div>
            )}
            {appState === "listening" && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm italic bg-black/70 px-4 py-2 rounded-full backdrop-blur-md border border-emerald-500/20 shadow-lg"
              >
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${isMicHearing ? "bg-emerald-300 scale-125 shadow-[0_0_12px_#34d399]" : "bg-emerald-400 animate-pulse"}`} />
                <span>{isMicHearing ? "Hearing your voice..." : "Listening..."}</span>
              </motion.div>
            )}
            {appState === "speaking" && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-pink-400 text-xs sm:text-sm italic bg-black/70 px-4 py-2 rounded-full backdrop-blur-md border border-pink-500/20 shadow-lg"
              >
                <Volume2 size={15} className="animate-pulse" />
                Speaking ({activeMode.name})...
              </motion.div>
            )}
            {appState === "reconnecting" && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-amber-400 text-xs sm:text-sm italic bg-black/70 px-4 py-2 rounded-full backdrop-blur-md border border-amber-500/20 shadow-lg"
              >
                <Loader2 size={15} className="animate-spin" />
                Reconnecting...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* High-Level 3D WebGL Hologram Sphere */}
        {!videoSrc && (
          <div 
            onClick={toggleListening}
            title={isSessionActive ? "Tap to end voice mode" : "Tap to start voice mode"}
            className={`w-full max-w-[380px] aspect-[4/5] rounded-[36px] ${activeTheme.cardBg} border ${activeTheme.borderStyle} shadow-2xl relative overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]`}
          >
            {/* 3D WebGL Interactive Three.js Visualizer */}
            <Visualizer3D state={appState} theme={activeTheme} mode={activeMode} />

            {/* In-Card Subtitle / Live Transcript Overlay */}
            <AnimatePresence>
              {messages.length > 0 && (
                <motion.div
                  key={messages[messages.length - 1].id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none px-4 py-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 text-center shadow-lg"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5 flex items-center justify-center gap-1.5">
                    {messages[messages.length - 1].sender === "zoya" ? (
                      <span className="text-pink-400 flex items-center gap-1">
                        <Sparkles size={11} /> {config.assistantName} ({activeMode.name})
                      </span>
                    ) : (
                      <span className="text-violet-400">
                        {config.userName || "You"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/95 line-clamp-2 leading-relaxed select-none font-medium">
                    {messages[messages.length - 1].text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Native Mobile Floating Dock / Thumb Navigation Bar */}
      <footer className="w-full flex flex-col items-center justify-center pb-6 sm:pb-8 pt-2 px-4 z-20 shrink-0 gap-3">
        {/* Text Input Row */}
        <AnimatePresence>
          {showTextInput && (
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onSubmit={handleTextSubmit}
              className="w-full max-w-md flex items-center gap-2 bg-[#12141D]/90 border border-white/15 rounded-full p-1.5 pl-4 backdrop-blur-xl shadow-2xl"
            >
              <input 
                type="text" 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Type message to ${config.assistantName} (${activeMode.name})...`}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 text-xs sm:text-sm"
                autoFocus
              />
              <button 
                type="submit" 
                disabled={!textInput.trim()}
                className="p-2.5 rounded-full bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:hover:bg-violet-500 transition-colors shrink-0"
              >
                <Send size={15} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Thumb Navigation Bar (Native Mobile Dock) */}
        <div className="w-full max-w-md bg-[#12141D]/90 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex items-center justify-around shadow-2xl">
          {/* 1. Theme & 4 Modes Drawer Trigger */}
          <button
            onClick={() => setShowThemeModeModal(true)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all relative"
            title="4 Modes & 3D Themes"
          >
            <Sparkles size={20} className="text-pink-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-[#12141D]" />
          </button>

          {/* 2. Keyboard Input Toggle */}
          <button
            onClick={() => setShowTextInput((prev) => !prev)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              showTextInput
                ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            title={showTextInput ? "Hide Keyboard" : "Type a message"}
          >
            <Keyboard size={20} />
          </button>

          {/* 3. Primary Voice Action Microphone CTA */}
          <button
            onClick={toggleListening}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 ${
              isSessionActive
                ? "bg-rose-500 text-white ring-4 ring-rose-500/25 animate-pulse shadow-rose-500/40"
                : "bg-gradient-to-tr from-violet-600 to-pink-500 text-white shadow-violet-500/30 hover:scale-105"
            }`}
            title={isSessionActive ? "End Voice Session" : `Start Voice Mode (${activeMode.name})`}
          >
            {isSessionActive ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          {/* 4. Topic & Script Focus Modal Trigger */}
          <button
            onClick={() => setShowTopicModal(true)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all relative"
            title="Topic & Script Focus"
          >
            <ScrollText size={20} className={config?.activeTopicOrScript?.trim() ? "text-amber-400" : "text-white/70"} />
            {config?.activeTopicOrScript?.trim() && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          {/* 5. Chat History Modal Trigger */}
          <button
            onClick={() => setShowChatHistory(true)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all relative"
            title="Chat History"
          >
            <MessageSquare size={20} className={messages.length > 0 ? "text-cyan-400" : "text-white/70"} />
            {messages.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-cyan-500 text-black text-[9px] font-bold flex items-center justify-center">
                {messages.length > 99 ? "99+" : messages.length}
              </span>
            )}
          </button>
        </div>
      </footer>

      {/* Theme & Companion Mode Selector Bottom Sheet Drawer */}
      <ThemeAndModeSelector
        isOpen={showThemeModeModal}
        onClose={() => setShowThemeModeModal(false)}
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />

      {/* Topic & Script Focus Modal */}
      {showTopicModal && (
        <TopicScriptModal
          assistantName={config?.assistantName}
          currentTopic={config?.activeTopicOrScript || ""}
          onSave={handleUpdateTopic}
          onClose={() => setShowTopicModal(false)}
        />
      )}

      {/* Voice Selection Modal */}
      {showVoiceModal && (
        <VoiceSelectorModal
          assistantName={config?.assistantName}
          currentVoice={config?.voiceName || "Kore"}
          onSelectVoice={handleSelectVoice}
          onClose={() => setShowVoiceModal(false)}
        />
      )}

      {/* Real ChatGPT Style Chatbox Modal */}
      <ChatGPTChatModal
        isOpen={showChatHistory}
        onClose={() => setShowChatHistory(false)}
        messages={messages}
        assistantName={config?.assistantName || "Zoya"}
        userName={config?.userName || "ASLAM"}
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        theme={activeTheme}
        onSendMessage={(text) => handleTextCommand(text)}
        onClear={() => {
          setMessages([]);
          resetZoyaSession();
          localStorage.removeItem("zoya_chat_history");
        }}
        onSpeakText={async (text) => {
          if (!isMuted) {
            setAppState("speaking");
            const audioBase64 = await getZoyaAudio(text, config);
            if (audioBase64) {
              await playPCM(audioBase64, isMuted ? 0 : volume);
            }
            setAppState("idle");
          }
        }}
        isProcessing={appState === "processing"}
      />
    </div>
  );
}
