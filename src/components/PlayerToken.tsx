import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { getSpacePosition, SPACE_SIZE, BOARD_PADDING } from "./Board";

const getTokenPixelPosition = (playerIndex: number, position: number, totalPlayers: number) => {
  const spacePos = getSpacePosition(position);
  
  const row = Math.floor(playerIndex / 2);
  const col = playerIndex % 2;
  const offsetX = 10 + col * 28;
  const offsetY = 10 + row * 28;
  
  return {
    x: spacePos.col * (SPACE_SIZE + 4) + BOARD_PADDING + offsetX,
    y: spacePos.row * (SPACE_SIZE + 4) + BOARD_PADDING + offsetY,
  };
};

const PlayerToken = ({ playerIndex }: { playerIndex: number }) => {
  const player = useGameStore((s: any) => s.players[playerIndex]);
  const totalPlayers = useGameStore((s: any) => s.players.length);
  
  const [currentPosition, setCurrentPosition] = useState(player?.position ?? 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevPositionRef = useRef(player?.position ?? 0);

  useEffect(() => {
    if (!player) return;
    
    const targetPosition = player.position;
    const startPosition = prevPositionRef.current;
    
    if (targetPosition !== startPosition && !isAnimating) {
      setIsAnimating(true);
      
      // Calculate steps - wrap around at 40 (Go is at 0)
      const totalSpaces = 40;
      let steps: number[] = [];
      
      if (targetPosition > startPosition) {
        // Moving forward
        for (let i = startPosition; i <= targetPosition; i++) {
          steps.push(i);
        }
      } else if (targetPosition < startPosition) {
        // Wrapping around past GO
        for (let i = startPosition; i < totalSpaces; i++) {
          steps.push(i);
        }
        for (let i = 0; i <= targetPosition; i++) {
          steps.push(i);
        }
      }
      
      // Animate through each step
      let stepIndex = 0;
      const animateStep = () => {
        if (stepIndex < steps.length) {
          setCurrentPosition(steps[stepIndex]);
          stepIndex++;
          setTimeout(animateStep, 80); // 80ms per step
        } else {
          setIsAnimating(false);
          prevPositionRef.current = targetPosition;
        }
      };
      
      animateStep();
    }
  }, [player?.position, isAnimating]);

  if (!player || player.bankrupt) return null;

  const { x, y } = getTokenPixelPosition(playerIndex, currentPosition, totalPlayers);
  const isMoving = isAnimating;

  return (
    <motion.div
      style={{
        position: "absolute",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, var(--gold-light), ${player.color}, var(--obsidian))`,
        border: "2px solid var(--gold-primary)",
        boxShadow: `
          0 6px 10px rgba(0, 0, 0, 0.6),
          inset 0 -2px 5px rgba(0,0,0,0.4),
          inset 0 2px 5px rgba(255,255,255,0.6)
        `,
        zIndex: 50 + playerIndex,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        cursor: "pointer",
      }}
      animate={{ 
        x, 
        y,
        scale: isMoving ? [1, 1.15, 1] : 1,
      }}
      transition={{ 
        x: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 },
        y: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 },
        scale: { duration: 0.15 }
      }}
      whileHover={{ scale: 1.2, zIndex: 100, boxShadow: "0 0 15px var(--gold-primary)" }}
      title={`${player.name} - £${player.cash}`}
    >
      <span style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.5))" }}>
        {player.token}
      </span>
    </motion.div>
  );
};

export const PlayerTokens = () => {
  const players = useGameStore((s: any) => s.players);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <AnimatePresence>
        {players.map((player: any, index: number) => (
          <div key={player.id} style={{ pointerEvents: "auto" }}>
            <PlayerToken playerIndex={index} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
