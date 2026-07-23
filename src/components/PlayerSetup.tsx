import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/gameStore";

const TOKENS = ["🚗", "🚙", "🚕", "🏎", "🚁", "✈️", "⛵", "🎭"];
const AI_NAMES = ["Bot Alpha", "Bot Beta", "Bot Gamma", "Bot Delta", "Bot Epsilon", "Bot Zeta", "Bot Eta"];

type GameMode = "select" | "single" | "multiplayer";

const PlayerSetup = () => {
  const [gameMode, setGameMode] = React.useState<GameMode>("select");
  
  // Single player state
  const [playerName, setPlayerName] = React.useState("");
  const [playerToken, setPlayerToken] = React.useState("");
  const [aiCount, setAiCount] = React.useState(1);
  const [aiTokens, setAiTokens] = React.useState<string[]>([""]);

  // Multiplayer state
  const [humanCount, setHumanCount] = React.useState(2);
  const [humanNames, setHumanNames] = React.useState<string[]>(["Player 1", "Player 2"]);
  const [humanTokens, setHumanTokens] = React.useState<string[]>(["", ""]);
  
  // AI state for multiplayer
  const [mpAiCount, setMpAiCount] = React.useState(0);
  const [mpAiTokens, setMpAiTokens] = React.useState<string[]>([]);

  // Single Player Handlers
  const handleAiCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setAiCount(count);
    setAiTokens(Array.from({ length: count }, () => ""));
  };

  const handleAiTokenSelect = (index: number, token: string) => {
    setAiTokens((prev) => {
      const updated = [...prev];
      updated[index] = token;
      return updated;
    });
  };

  // Multiplayer Handlers
  const handleHumanCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setHumanCount(count);
    setHumanNames(prev => {
      const next = [...prev];
      while (next.length < count) next.push(`Player ${next.length + 1}`);
      return next.slice(0, count);
    });
    setHumanTokens(prev => {
      const next = [...prev];
      while (next.length < count) next.push("");
      return next.slice(0, count);
    });
  };

  const handleMpAiCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setMpAiCount(count);
    setMpAiTokens(Array.from({ length: count }, () => ""));
  };

  const handleHumanNameChange = (index: number, name: string) => {
    setHumanNames(prev => {
      const next = [...prev];
      next[index] = name;
      return next;
    });
  };

  const handleHumanTokenSelect = (index: number, token: string) => {
    setHumanTokens(prev => {
      const next = [...prev];
      next[index] = token;
      return next;
    });
  };

  const handleMpAiTokenSelect = (index: number, token: string) => {
    setMpAiTokens(prev => {
      const next = [...prev];
      next[index] = token;
      return next;
    });
  };

  const getAvailableTokens = (excludeIndex?: number) => {
    const usedTokens = new Set<string>();
    if (playerToken) usedTokens.add(playerToken);
    aiTokens.forEach((t, i) => {
      if (t && i !== excludeIndex) usedTokens.add(t);
    });
    return TOKENS.filter((t) => !usedTokens.has(t));
  };

  const getMultiplayerAvailableTokens = (type: "human" | "ai", index: number) => {
    const used = new Set<string>();
    humanTokens.forEach((t, i) => { if (type === "human" && i === index) return; if (t) used.add(t); });
    mpAiTokens.forEach((t, i) => { if (type === "ai" && i === index) return; if (t) used.add(t); });
    return TOKENS.filter(t => !used.has(t));
  };

  const startSinglePlayerGame = () => {
    if (!playerToken) return;
    if (aiTokens.some((t) => !t)) return;

    const names = [playerName || "You", ...aiTokens.map((_, i) => AI_NAMES[i] ?? `Bot ${i + 1}`)];
    const tokens = [playerToken, ...aiTokens];
    const isAIFlags = [false, ...aiTokens.map(() => true)];

    useGameStore.getState().initGame(names, tokens, isAIFlags);
  };

  const startMultiplayerGame = () => {
    if (humanTokens.some(t => !t)) return;
    if (mpAiTokens.some(t => !t)) return;

    const names = [...humanNames, ...mpAiTokens.map((_, i) => AI_NAMES[i] ?? `Bot ${i + 1}`)];
    const tokens = [...humanTokens, ...mpAiTokens];
    const isAIFlags = [...humanTokens.map(() => false), ...mpAiTokens.map(() => true)];

    useGameStore.getState().initGame(names, tokens, isAIFlags);
  };

  // Game mode selection screen
  if (gameMode === "select") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "transparent",
          padding: "40px",
          gap: "24px",
        }}
      >
        <motion.div
          className="deco-modal deco-border"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            padding: "48px",
            textAlign: "center",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <h1
            className="deco-title"
            style={{
              fontSize: "42px",
              marginBottom: "16px",
            }}
          >
            THE GRAND
            <div style={{ fontSize: "20px", color: "var(--ivory)", marginTop: "8px", fontFamily: "var(--font-body)", letterSpacing: "8px" }}>MONOPOLY</div>
          </h1>
          <p style={{ color: "var(--gold-dark)", marginBottom: "40px", fontSize: "16px", fontStyle: "italic", fontFamily: "var(--font-heading)", letterSpacing: "1px" }}>
            Select your preferred experience
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <motion.button
              className="button"
              onClick={() => setGameMode("single")}
              whileHover={{ scale: 1.02, borderColor: "var(--gold-primary)", boxShadow: "0 0 15px rgba(212,175,55,0.2)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: "20px 40px",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <span style={{ fontSize: "24px" }}>👤</span>
              Private Table
            </motion.button>

            <motion.button
              className="button"
              onClick={() => setGameMode("multiplayer")}
              whileHover={{ scale: 1.02, borderColor: "var(--gold-primary)", boxShadow: "0 0 15px rgba(212,175,55,0.2)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: "20px 40px",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <span style={{ fontSize: "24px" }}>👥</span>
              High Roller Suite
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Single player setup
  if (gameMode === "single") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "transparent",
          padding: "20px",
          gap: "16px",
          overflow: "auto",
        }}
      >
        <motion.div
          className="deco-modal deco-border"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            padding: "24px",
            textAlign: "center",
            maxWidth: "700px",
            width: "100%",
            maxHeight: "95vh",
            overflowY: "auto",
          }}
        >
          <button
            className="button"
            onClick={() => setGameMode("select")}
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              fontSize: "12px",
              padding: "6px 12px",
            }}
          >
            BACK
          </button>

          <h1
            className="deco-title"
            style={{
              fontSize: "24px",
              marginBottom: "20px",
              marginTop: "16px"
            }}
          >
            Private Table
          </h1>

          {/* Your setup - Compact */}
          <div
            style={{
              marginBottom: "16px",
              padding: "16px",
              backgroundColor: "var(--charcoal)",
              borderRadius: "2px",
              border: "1px solid var(--gold-dark)",
            }}
          >
            <h3 className="deco-title" style={{ marginBottom: "12px", fontSize: "16px" }}>VIP Guest</h3>
            
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "500",
                  fontSize: "10px",
                  textAlign: "left",
                  color: "var(--ivory)",
                  letterSpacing: "1px",
                  textTransform: "uppercase"
                }}
              >
                Alias (Optional):
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="High Roller"
                style={{ width: "100%", boxSizing: "border-box", padding: "6px 10px" }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  fontSize: "10px",
                  textAlign: "left",
                  color: "var(--ivory)",
                  letterSpacing: "1px",
                  textTransform: "uppercase"
                }}
              >
                Select Token:
              </label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                {TOKENS.map((token) => (
                  <motion.button
                    key={token}
                    onClick={() => setPlayerToken(token)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      fontSize: "20px",
                      padding: "6px",
                      width: "40px",
                      height: "40px",
                      borderRadius: "2px",
                      border: playerToken === token ? "2px solid var(--gold-primary)" : "1px solid var(--gold-dark)",
                      backgroundColor: playerToken === token ? "var(--charcoal)" : "var(--obsidian)",
                      boxShadow: playerToken === token ? "0 0 12px rgba(212,175,55,0.3)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {token}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Opponents */}
          {/* AI Selection - Compact Grid Layout */}
          <div
            style={{
              marginBottom: "24px",
              padding: "20px",
              backgroundColor: "var(--charcoal)",
              borderRadius: "2px",
              border: "1px solid var(--gold-dark)",
            }}
          >
            <h3 className="deco-title" style={{ marginBottom: "12px", fontSize: "18px" }}>The House (AI)</h3>
            
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  fontSize: "11px",
                  textAlign: "left",
                  color: "var(--ivory)",
                  letterSpacing: "1px",
                  textTransform: "uppercase"
                }}
              >
                Opponents:
              </label>
              <select
                value={aiCount}
                onChange={handleAiCountChange}
                style={{ width: "100%", boxSizing: "border-box", backgroundColor: "var(--obsidian)", padding: "8px" }}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <option key={num} value={num}>
                    {num} House Player{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Compact AI Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "8px" }}>
              <AnimatePresence>
                {Array.from({ length: aiCount }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      padding: "10px",
                      backgroundColor: "var(--obsidian)",
                      border: "1px solid var(--gold-dark)",
                      borderRadius: "2px",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <span style={{ fontWeight: "500", fontSize: "12px", color: "var(--gold-light)", fontFamily: "var(--font-heading)", letterSpacing: "1px" }}>
                        {AI_NAMES[index] ?? `Bot ${index + 1}`}
                      </span>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center" }}>
                        {TOKENS.map((token) => {
                          const isUsedByPlayer = playerToken === token;
                          const isUsedByOtherAI = aiTokens.some((t, i) => t === token && i !== index);
                          const isDisabled = isUsedByPlayer || isUsedByOtherAI;
                          return (
                            <motion.button
                              key={token}
                              onClick={() => !isDisabled && handleAiTokenSelect(index, token)}
                              whileHover={{ scale: isDisabled ? 1 : 1.1 }}
                              whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                              style={{
                                fontSize: "16px",
                                padding: "4px",
                                width: "32px",
                                height: "32px",
                                borderRadius: "2px",
                                border: aiTokens[index] === token ? "2px solid var(--gold-primary)" : "1px solid var(--gold-dark)",
                                backgroundColor: aiTokens[index] === token ? "var(--charcoal)" : "var(--obsidian)",
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                opacity: isDisabled ? 0.3 : 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              {token}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <motion.button
            className="button action-button"
            onClick={startSinglePlayerGame}
            disabled={!playerToken || aiTokens.some((t) => !t)}
            whileHover={{ scale: playerToken && aiTokens.every((t) => t) ? 1.05 : 1 }}
            whileTap={{ scale: playerToken && aiTokens.every((t) => t) ? 0.95 : 1 }}
            style={{
              padding: "12px 32px",
              fontSize: "16px",
              width: "100%",
              marginTop: "8px"
            }}
          >
            ENTER THE GAME
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Multiplayer setup
  if (gameMode === "multiplayer") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "transparent",
          padding: "40px",
          gap: "24px",
        }}
      >
        <motion.div
          className="deco-modal deco-border"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            padding: "40px",
            textAlign: "center",
            maxWidth: "650px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <button
            className="button"
            onClick={() => setGameMode("select")}
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              fontSize: "16px",
              padding: "8px 16px",
            }}
          >
            BACK
          </button>

          <h1
            className="deco-title"
            style={{
              fontSize: "32px",
              marginBottom: "32px",
              marginTop: "20px"
            }}
          >
            High Roller Suite
          </h1>

          {/* Human Players */}
          <div
            style={{
              marginBottom: "32px",
              padding: "24px",
              backgroundColor: "var(--charcoal)",
              borderRadius: "2px",
              border: "1px solid var(--gold-dark)",
            }}
          >
            <h3 className="deco-title" style={{ marginBottom: "16px", fontSize: "20px" }}>VIP Guests</h3>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "12px", textAlign: "left", color: "var(--ivory)", letterSpacing: "1px", textTransform: "uppercase" }}>
                Number of Guests:
              </label>
              <select
                value={humanCount}
                onChange={handleHumanCountChange}
                style={{ width: "100%", boxSizing: "border-box", backgroundColor: "var(--obsidian)" }}
              >
                {[2, 3, 4].map(num => (
                  <option key={num} value={num}>{num} Players</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {Array.from({ length: humanCount }).map((_, index) => (
                <div key={index} style={{ padding: "16px", background: "var(--obsidian)", borderRadius: "2px", border: "1px solid var(--gold-dark)" }}>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "500", color: "var(--gold-light)", fontFamily: "var(--font-heading)", letterSpacing: "1px" }}>Guest {index + 1} Alias:</label>
                    <input
                      type="text"
                      value={humanNames[index]}
                      onChange={(e) => handleHumanNameChange(index, e.target.value)}
                      style={{ width: "100%", marginTop: "8px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "500", display: "block", marginBottom: "8px", color: "var(--gold-light)", fontFamily: "var(--font-heading)", letterSpacing: "1px" }}>Token:</label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {getMultiplayerAvailableTokens("human", index).map(token => (
                        <button
                          key={token}
                          onClick={() => handleHumanTokenSelect(index, token)}
                          style={{
                            fontSize: "24px",
                            padding: "8px",
                            borderRadius: "2px",
                            border: humanTokens[index] === token ? "2px solid var(--gold-primary)" : "1px solid var(--gold-dark)",
                            backgroundColor: humanTokens[index] === token ? "var(--charcoal)" : "var(--obsidian)",
                            cursor: "pointer",
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                          }}
                        >
                          {token}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Opponents */}
          <div
            style={{
              marginBottom: "32px",
              padding: "24px",
              backgroundColor: "var(--charcoal)",
              borderRadius: "2px",
              border: "1px solid var(--gold-dark)",
            }}
          >
            <h3 className="deco-title" style={{ marginBottom: "16px", fontSize: "20px" }}>The House (AI)</h3>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "12px", textAlign: "left", color: "var(--ivory)", letterSpacing: "1px", textTransform: "uppercase" }}>
                Add House Players:
              </label>
              <select
                value={mpAiCount}
                onChange={handleMpAiCountChange}
                style={{ width: "100%", boxSizing: "border-box", backgroundColor: "var(--obsidian)" }}
              >
                {[0, 1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Bots</option>
                ))}
              </select>
            </div>

            <AnimatePresence>
              {Array.from({ length: mpAiCount }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginBottom: "12px", padding: "16px", backgroundColor: "var(--obsidian)", borderRadius: "2px", border: "1px solid var(--gold-dark)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontWeight: "500", fontSize: "14px", minWidth: "90px", color: "var(--gold-light)", fontFamily: "var(--font-heading)", letterSpacing: "1px" }}>
                      {AI_NAMES[index] ?? `Bot ${index + 1}`}:
                    </span>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {getMultiplayerAvailableTokens("ai", index).map(token => (
                        <button
                          key={token}
                          onClick={() => handleMpAiTokenSelect(index, token)}
                          style={{
                            fontSize: "24px",
                            padding: "8px",
                            borderRadius: "2px",
                            border: mpAiTokens[index] === token ? "2px solid var(--gold-primary)" : "1px solid var(--gold-dark)",
                            backgroundColor: mpAiTokens[index] === token ? "var(--charcoal)" : "var(--obsidian)",
                            cursor: "pointer",
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                          }}
                        >
                          {token}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.button
            className="button action-button"
            onClick={startMultiplayerGame}
            disabled={humanTokens.some(t => !t) || mpAiTokens.some(t => !t)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "16px 48px",
              fontSize: "18px",
              width: "100%",
              opacity: (humanTokens.some(t => !t) || mpAiTokens.some(t => !t)) ? 0.5 : 1,
            }}
          >
            ENTER THE GAME
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default PlayerSetup;
