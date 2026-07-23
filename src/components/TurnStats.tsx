import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { useLocalStore } from "../store/localStore";

export const TurnStats = () => {
  const { turnStats, myPlayerIndex } = useLocalStore();
  const { currentPlayerIndex } = useGameStore();

  if (!turnStats || turnStats.playerIndex !== myPlayerIndex) {
    return null;
  }

  const isCurrentTurn = turnStats.isActive && currentPlayerIndex === myPlayerIndex;
  
  const moneyIn = turnStats.moneyIn || 0;
  const moneyOut = turnStats.moneyOut || 0;
  const netChange = (turnStats.endCash || turnStats.startCash) - turnStats.startCash;
  const isPositive = netChange >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: isCurrentTurn 
          ? "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))"
          : "rgba(15, 16, 18, 0.8)",
        border: isCurrentTurn ? "2px solid var(--gold-primary)" : "1px solid var(--gold-dark)",
        borderRadius: "4px",
        padding: "10px 14px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "12px",
        alignItems: "center"
      }}
    >
      {/* Turn Info */}
      <div>
        <div style={{ fontSize: "10px", color: "var(--gold-dark)", letterSpacing: "1px", textTransform: "uppercase" }}>
          Turn {turnStats.turnNumber}
        </div>
        <div style={{ fontSize: "18px", color: "var(--gold-primary)", fontWeight: 600, fontFamily: "var(--font-heading)" }}>
          £{turnStats.startCash} → £{turnStats.endCash || turnStats.startCash}
        </div>
      </div>

      {/* Dice & Space */}
      <div style={{ textAlign: "center" }}>
        {turnStats.diceRoll ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px" }}>🎲</span>
            <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--ivory)" }}>
              {turnStats.diceRoll.die1}+{turnStats.diceRoll.die2}={turnStats.diceRoll.total}
            </span>
            {turnStats.diceRoll.isDoubles && (
              <span style={{ fontSize: "9px", color: "var(--gold-primary)" }}>DBL</span>
            )}
          </div>
        ) : (
          <div style={{ fontSize: "11px", color: "var(--gold-dark)", fontStyle: "italic" }}>No roll yet</div>
        )}
        {turnStats.spaceLanded && (
          <div style={{ fontSize: "10px", color: "var(--ivory-dark)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            📍 {turnStats.spaceLanded}
          </div>
        )}
      </div>

      {/* Money Flow */}
      <div style={{ textAlign: "right" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", fontSize: "11px" }}>
          <span style={{ color: moneyIn > 0 ? "var(--emerald)" : "var(--charcoal)" }}>+£{moneyIn}</span>
          <span style={{ color: moneyOut > 0 ? "var(--ruby)" : "var(--charcoal)" }}>-£{moneyOut}</span>
        </div>
        <div style={{
          fontSize: "14px",
          fontWeight: 700,
          fontFamily: "var(--font-heading)",
          color: isPositive ? "var(--emerald)" : "var(--ruby)"
        }}>
          {isPositive ? "+" : ""}£{Math.abs(netChange)}
        </div>
      </div>
    </motion.div>
  );
};

export default TurnStats;
