import React, { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { useLocalStore } from "../store/localStore";
import type { Player, Property } from "../types/game";

interface PlayerSummaryCardProps {
  playerIndex: number;
  isCompact?: boolean;
  onExpand?: () => void;
}

export const PlayerSummaryCard = ({ playerIndex, isCompact = false, onExpand }: PlayerSummaryCardProps) => {
  const { players, spaces, currentPlayerIndex } = useGameStore();
  const { myPlayerIndex } = useLocalStore();
  
  const player = players[playerIndex];
  const isCurrentTurn = currentPlayerIndex === playerIndex;
  const isYou = myPlayerIndex === playerIndex;
  
  if (!player) return null;
  
  const ownedProperties = spaces.filter(
    (s): s is Property =>
      (s.type === "property" || s.type === "railroad" || s.type === "utility") &&
      (s as Property).owner === playerIndex
  ) as Property[];
  
  const propertyCount = ownedProperties.length;
  const houseCount = ownedProperties.reduce((acc, p) => acc + p.houses, 0);
  const hotelCount = ownedProperties.filter(p => p.hotel).length;
  const netWorth = player.cash + ownedProperties.reduce((acc, p) => {
    let value = p.mortgageValue;
    if (p.houses > 0) value += (p.buildingCost ?? 0) * p.houses;
    if (p.hotel) value += (p.buildingCost ?? 0) * 5;
    return acc + value;
  }, 0);

  if (isCompact) {
    return (
      <motion.div
        onClick={onExpand}
        whileHover={{ scale: 1.01, x: 2 }}
        style={{
          background: isCurrentTurn 
            ? "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.03))"
            : "var(--card-bg)",
          borderRadius: "3px",
          padding: "8px 10px",
          border: isCurrentTurn 
            ? "1px solid var(--gold-primary)"
            : "1px solid var(--gold-dark)",
          boxShadow: isCurrentTurn 
            ? "0 0 12px rgba(212,175,55,0.2)"
            : "none",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Current turn indicator */}
        {isCurrentTurn && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "3px",
              height: "100%",
              background: "var(--gold-primary)"
            }}
          />
        )}
        
        {/* Token */}
        <div
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            background: `radial-gradient(circle at 30% 30%, var(--gold-light), ${player.color}, var(--obsidian))`,
            border: "1px solid var(--gold-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            flexShrink: 0
          }}
        >
          {player.token}
        </div>
        
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "11px",
            fontFamily: "var(--font-heading)",
            letterSpacing: "1px",
            color: "var(--ivory)",
            textTransform: "uppercase"
          }}>
            <span style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              {player.name}
            </span>
            {player.bankrupt && (
              <span style={{ color: "var(--ruby)", fontSize: "8px" }}>BANKRUPT</span>
            )}
            {isCurrentTurn && (
              <span style={{ color: "var(--gold-primary)", fontSize: "8px" }}>●</span>
            )}
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "2px",
            fontSize: "10px",
            color: "var(--gold-light)"
          }}>
            <span>£{player.cash.toLocaleString()}</span>
            <span style={{ color: "var(--ivory-dark)" }}>|</span>
            <span title="Properties">{propertyCount}🏠</span>
            {(houseCount > 0 || hotelCount > 0) && (
              <>
                <span style={{ color: "var(--ivory-dark)" }}>|</span>
                <span>{houseCount > 0 && `${houseCount}🏠`}{hotelCount > 0 && ` ${hotelCount}🏨`}</span>
              </>
            )}
          </div>
        </div>
        
        {/* Net Worth */}
        <div style={{
          textAlign: "right",
          flexShrink: 0
        }}>
          <div style={{ fontSize: "8px", color: "var(--gold-dark)", letterSpacing: "1px" }}>NET</div>
          <div style={{ fontSize: "11px", color: "var(--gold-primary)", fontWeight: 600 }}>£{netWorth.toLocaleString()}</div>
        </div>
      </motion.div>
    );
  }
  
  return null;
};

export default PlayerSummaryCard;
