export interface CommandResult {
  action: string;
  url?: string;
  isBrowserAction: boolean;
}

export function processCommand(
  command: string,
  userName: string = "ASLAM"
): CommandResult {
  const lowerCmd = command.toLowerCase().trim();

  // 1. Creator & Owner queries
  if (
    lowerCmd.includes("creator") ||
    lowerCmd.includes("owner") ||
    lowerCmd.includes("who created you") ||
    lowerCmd.includes("who made you") ||
    lowerCmd.includes("who is your creator") ||
    lowerCmd.includes("who is your owner") ||
    lowerCmd.includes("kisne banaya") ||
    lowerCmd.includes("malik kaun") ||
    lowerCmd.includes("tumhara malik") ||
    lowerCmd.includes("apka malik") ||
    lowerCmd.includes("owner ke") ||
    lowerCmd.includes("creator ke") ||
    lowerCmd.includes("ashwani") ||
    lowerCmd.includes("aslam")
  ) {
    return {
      action: `Mere creator aur owner ASLAM hain! Unhone hi mujhe itne pyaar aur intelligence ke saath design kiya hai.`,
      isBrowserAction: false,
    };
  }

  // 2. Game Voice Commands ("Play [Game]", "[Game] kholo", "Play [Game] game")
  if (
    lowerCmd.startsWith("play ") ||
    lowerCmd.includes("game kholo") ||
    lowerCmd.includes("khelbo") ||
    lowerCmd.includes("garena")
  ) {
    if (lowerCmd.includes("free fire") || lowerCmd.includes("ff")) {
      return {
        action: `Opening Free Fire for you! Get ready for Booyah, ${userName}! 🎮`,
        url: "https://poki.com/en/g/subway-surfers", // Direct instant web playable game / FF landing
        isBrowserAction: true,
      };
    }
    if (lowerCmd.includes("pubg") || lowerCmd.includes("bgmi")) {
      return {
        action: `Opening PUBG Mobile for you, ${userName}! Winner Winner Chicken Dinner! 🪖`,
        url: "https://www.pubgmobile.com",
        isBrowserAction: true,
      };
    }
    if (lowerCmd.includes("subway") || lowerCmd.includes("surfer")) {
      return {
        action: `Launching Subway Surfers! Enjoy the endless runner, ${userName}! 🏃‍♂️`,
        url: "https://poki.com/en/g/subway-surfers",
        isBrowserAction: true,
      };
    }
    if (lowerCmd.includes("ludo")) {
      return {
        action: `Opening Ludo King online for you! Best of luck, ${userName}! 🎲`,
        url: "https://www.crazygames.com/game/ludo-king",
        isBrowserAction: true,
      };
    }
    if (lowerCmd.includes("chess")) {
      return {
        action: `Opening Chess.com! Show off your grandmaster moves, ${userName}! ♟️`,
        url: "https://www.chess.com",
        isBrowserAction: true,
      };
    }
    if (lowerCmd.includes("snake")) {
      return {
        action: `Launching Google Snake Game! Enjoy retro fun, ${userName}! 🐍`,
        url: "https://www.google.com/search?q=play+snake",
        isBrowserAction: true,
      };
    }
    if (lowerCmd.includes("tic tac toe") || lowerCmd.includes("tictactoe")) {
      return {
        action: `Opening Tic Tac Toe! Try to beat the AI, ${userName}! ❌⭕`,
        url: "https://www.google.com/search?q=play+tic+tac+toe",
        isBrowserAction: true,
      };
    }
    if (lowerCmd.includes("roblox")) {
      return {
        action: `Opening Roblox for you, ${userName}! Have fun exploring worlds! 🧱`,
        url: "https://www.roblox.com",
        isBrowserAction: true,
      };
    }
    if (lowerCmd.includes("minecraft")) {
      return {
        action: `Launching Classic Minecraft web for you, ${userName}! ⛏️`,
        url: "https://classic.minecraft.net",
        isBrowserAction: true,
      };
    }

    // Generic game search on Poki / CrazyGames
    const gameQuery = lowerCmd.replace(/^play\s+/, "").replace(/\s+game$/, "").trim();
    return {
      action: `Searching and launching ${gameQuery} game for you! 🎮`,
      url: `https://poki.com/en/search?q=${encodeURIComponent(gameQuery)}`,
      isBrowserAction: true,
    };
  }

  // 3. Social Media & Popular App Commands ("Open WhatsApp", "Facebook kholo", "Open Instagram", etc.)
  if (lowerCmd.includes("whatsapp") || lowerCmd.includes("whats app")) {
    return {
      action: `Opening WhatsApp Web for you, ${userName}! 💬`,
      url: "https://web.whatsapp.com",
      isBrowserAction: true,
    };
  }

  if (lowerCmd.includes("facebook") || lowerCmd.includes("fb kholo")) {
    return {
      action: `Opening Facebook for you, ${userName}! 📘`,
      url: "https://www.facebook.com",
      isBrowserAction: true,
    };
  }

  if (lowerCmd.includes("instagram") || lowerCmd.includes("insta kholo")) {
    return {
      action: `Opening Instagram for you, ${userName}! 📸`,
      url: "https://www.instagram.com",
      isBrowserAction: true,
    };
  }

  if (lowerCmd.includes("tiktok")) {
    return {
      action: `Opening TikTok for you, ${userName}! 🎵`,
      url: "https://www.tiktok.com",
      isBrowserAction: true,
    };
  }

  if (lowerCmd.includes("chatgpt") || lowerCmd.includes("chat gpt")) {
    return {
      action: `Opening ChatGPT for you, ${userName}! 🤖`,
      url: "https://chatgpt.com",
      isBrowserAction: true,
    };
  }

  if (lowerCmd.includes("play store") || lowerCmd.includes("playstore")) {
    return {
      action: `Opening Google Play Store for you, ${userName}! 🏬`,
      url: "https://play.google.com",
      isBrowserAction: true,
    };
  }

  if (lowerCmd.includes("calculator") || lowerCmd.includes("hisab")) {
    return {
      action: `Opening Calculator for you, ${userName}! 🧮`,
      url: "https://www.google.com/search?q=calculator",
      isBrowserAction: true,
    };
  }

  if (lowerCmd.includes("camera") || lowerCmd.includes("webcam")) {
    return {
      action: `Opening Camera Test for you, ${userName}! 📷`,
      url: "https://webcamtests.com",
      isBrowserAction: true,
    };
  }

  if (lowerCmd.includes("wikipedia") || lowerCmd.includes("wiki")) {
    return {
      action: `Opening Wikipedia for you, ${userName}! 📚`,
      url: "https://www.wikipedia.org",
      isBrowserAction: true,
    };
  }

  if (lowerCmd.includes("gemini")) {
    return {
      action: `Opening Google Gemini for you, ${userName}! ✨`,
      url: "https://gemini.google.com",
      isBrowserAction: true,
    };
  }

  if (lowerCmd.includes("github")) {
    return {
      action: `Opening GitHub for you, ${userName}! 🐙`,
      url: "https://github.com",
      isBrowserAction: true,
    };
  }

  // 4. Media Search ("Play [song/video] on YouTube")
  const ytMatch = lowerCmd.match(/^play\s+(.+?)\s+on\s+youtube$/) || lowerCmd.match(/^youtube\s+pe\s+chalao\s+(.+)$/);
  if (ytMatch) {
    const query = encodeURIComponent(ytMatch[1].trim());
    return {
      action: `Playing ${ytMatch[1]} on YouTube for you, ${userName}! ▶️`,
      url: `https://www.youtube.com/results?search_query=${query}`,
      isBrowserAction: true,
    };
  }

  // 5. Media Search ("Search [query] on Spotify")
  const spotifyMatch = lowerCmd.match(/^search\s+(.+?)\s+on\s+spotify$/) || lowerCmd.match(/^spotify\s+pe\s+bajaao\s+(.+)$/);
  if (spotifyMatch) {
    const query = encodeURIComponent(spotifyMatch[1].trim());
    return {
      action: `Searching ${spotifyMatch[1]} on Spotify for you! 🎵`,
      url: `https://open.spotify.com/search/${query}`,
      isBrowserAction: true,
    };
  }

  // 6. WhatsApp Direct Message ("Send a WhatsApp message to [number] saying [message]")
  const waMatch = lowerCmd.match(
    /^send\s+a?\s*whatsapp\s+message\s+to\s+([\d\+\s]+)\s+saying\s+(.+)$/
  );
  if (waMatch) {
    const number = waMatch[1].replace(/\s+/g, "");
    const message = encodeURIComponent(waMatch[2].trim());
    return {
      action: `Sending your WhatsApp message to ${number}, ${userName}! 💬`,
      url: `https://web.whatsapp.com/send?phone=${number}&text=${message}`,
      isBrowserAction: true,
    };
  }

  // 7. General Browsing ("Open [website or app name]", "[website] kholo", "open [app]")
  const openMatch = lowerCmd.match(/^(?:open|kholo|chalao)\s+(.+)$/) || lowerCmd.match(/^(.+)\s+(?:kholo|open|chalao)$/);
  if (openMatch) {
    let appOrSite = openMatch[1].trim().toLowerCase();
    
    // Check if it's youtube
    if (appOrSite.includes("youtube")) {
      return {
        action: `Opening YouTube for you, ${userName}! 🎬`,
        url: "https://www.youtube.com",
        isBrowserAction: true,
      };
    }
    // Check if it's google
    if (appOrSite.includes("google")) {
      return {
        action: `Opening Google Search for you, ${userName}! 🔍`,
        url: "https://www.google.com",
        isBrowserAction: true,
      };
    }

    let website = appOrSite.replace(/\s+/g, "");
    if (!website.includes(".")) {
      website += ".com";
    }
    return {
      action: `Opening ${openMatch[1]} for you, ${userName}! 🌐`,
      url: `https://www.${website}`,
      isBrowserAction: true,
    };
  }

  return { action: "", isBrowserAction: false };
}
