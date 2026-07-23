import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import type { GameLogEntry } from "../types/game";

const getLogIcon = (type: GameLogEntry["type"]): string => {
  switch (type) {
    case "roll": return "🎲";
    case "move": return "🚶";
    case "buy": return "🏠";
    case "rent": return "💰";
    case "card": return "🃏";
    case "jail": return "🔒";
    case "tax": return "📋";
    case "auction": return "🔨";
    case "trade": return "🤝";
    case "bankrupt": return "💸";
    case "system": return "📢";
    default: return "•";
  }
};

const getLogColor = (type: GameLogEntry["type"]): string => {
  switch (type) {
    case "roll": return "var(--ivory)";
    case "move": return "var(--ivory-dark)";
    case "buy": return "var(--gold-light)";
    case "rent": return "var(--gold-primary)";
    case "card": return "var(--prop-pink)";
    case "jail": return "var(--ruby)";
    case "tax": return "var(--gold-dark)";
    case "auction": return "var(--prop-orange)";
    case "trade": return "var(--emerald)";
    case "bankrupt": return "var(--ruby)";
    case "system": return "var(--prop-lightblue)";
    default: return "var(--charcoal)";
  }
};

export const GameLog = () => {
  const { gameLog, players } = useGameStore();
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Show last 8 entries when expanded
  const recentLogs = gameLog.slice(-8);
  
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      style={{
        position: "fixed",
        bottom: isMinimized ? "-4px" : "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Main Ledger Panel */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "var(--card-bg)",
              borderRadius: "2px 2px 0 0",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.8)",
              border: "1px solid var(--gold-dark)",
              borderBottom: "none",
              width: "500px",
              maxHeight: "400px",
              overflow: "hidden"
            }}
          >
            {/* Decorative corners */}
            <div style={{ position: "absolute", top: 2, left: 2, width: 8, height: 8, borderTop: "1px solid var(--gold-primary)", borderLeft: "1px solid var(--gold-primary)" }} />
            <div style={{ position: "absolute", top: 2, right: 2, width: 8, height: 8, borderTop: "1px solid var(--gold-primary)", borderRight: "1px solid var(--gold-primary)" }} />

            <h3
              className="deco-title"
              style={{
                margin: "0 0 12px 0",
                fontSize: "16px",
                borderBottom: "1px solid var(--gold-dark)",
                paddingBottom: "8px",
                textAlign: "center",
                letterSpacing: "2px",
                textTransform: "uppercase"
              }}
            >
              The Ledger
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                overflowY: "auto",
                maxHeight: "300px"
              }}
              className="hide-scrollbar"
            >
              {recentLogs.length === 0 ? (
                <div
                  style={{
                    color: "var(--gold-dark)",
                    fontSize: "12px",
                    fontFamily: "var(--font-heading)",
                    fontStyle: "italic",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  The night is young...
                </div>
              ) : (
                recentLogs.map((entry) => {
                  const player = entry.playerIndex !== undefined ? players[entry.playerIndex] : undefined;
                  return (
                    <div
                      key={entry.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        padding: "4px 8px",
                        background: "rgba(15, 16, 18, 0.4)",
                        borderBottom: "1px dotted var(--gold-dark)",
                        borderLeft: `2px solid ${getLogColor(entry.type)}`,
                      }}
                    >
                      <span style={{ fontSize: "12px", filter: "sepia(100%) hue-rotate(10deg) saturate(200%)" }}>{getLogIcon(entry.type)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            color: "var(--ivory)",
                            fontSize: "10px",
                            fontFamily: "var(--font-body)",
                            lineHeight: 1.3,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            letterSpacing: "0.5px"
                          }}
                        >
                          {entry.message}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            marginTop: "2px",
                          }}
                        >
                          {player && (
                            <span
                              style={{
                                width: "5px",
                                height: "5px",
                                borderRadius: "50%",
                                background: player.color,
                                boxShadow: `0 0 3px ${player.color}`
                              }}
                            />
                          )}
                          <span
                            style={{
                              color: "var(--gold-dark)",
                              fontSize: "8px",
                              fontFamily: "var(--font-heading)",
                              letterSpacing: "1px"
                            }}
                          >
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Handle */}
      <motion.button
        onClick={() => setIsMinimized(!isMinimized)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--gold-dark)",
          borderRadius: isMinimized ? "4px" : "0 0 4px 4px",
          padding: "6px 24px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          fontFamily: "var(--font-heading)",
          fontSize: "11px",
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "var(--gold-primary)",
          position: "relative",
          zIndex: 10000
        }}
      >
        <span>{isMinimized ? "📜" : "▼"}</span>
        <span>The Ledger</span>
        <span>{isMinimized ? "📜" : "▼"}</span>
      </motion.button>
    </motion.div>
  );
};

export default GameLog;
