import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";

interface DiceProps {
  onRollComplete?: () => void;
  autoRoll?: boolean;
}

export const Dice: React.FC<DiceProps> = ({ onRollComplete, autoRoll = true }) => {
  const [rolling, setRolling] = React.useState(false);
  const [displayDie1, setDisplayDie1] = React.useState(1);
  const [displayDie2, setDisplayDie2] = React.useState(1);
  const [finalRoll, setFinalRoll] = React.useState<{ die1: number; die2: number; total: number; isDoubles: boolean } | null>(null);
  
  const currentRoll = useGameStore((s) => s.diceRoll);
  const rollDiceAction = useGameStore((s) => s.rollDice);

  // Auto-roll on mount if autoRoll is true
  React.useEffect(() => {
    if (autoRoll && !rolling && !finalRoll) {
      startRoll();
    }
  }, []);

  // React to server roll update
  React.useEffect(() => {
    if (rolling && currentRoll) {
      // Server responded!
      setDisplayDie1(currentRoll.die1);
      setDisplayDie2(currentRoll.die2);
      setFinalRoll(currentRoll);
      setRolling(false);
      
      setTimeout(() => {
        onRollComplete?.();
      }, 500);
    }
  }, [currentRoll, rolling]);

  // Animate through random values during roll
  React.useEffect(() => {
    if (rolling) {
      const interval = setInterval(() => {
        setDisplayDie1(Math.floor(Math.random() * 6) + 1);
        setDisplayDie2(Math.floor(Math.random() * 6) + 1);
      }, 80);
      
      return () => clearInterval(interval);
    }
  }, [rolling]);

  const startRoll = () => {
    setRolling(true);
    setFinalRoll(null);
    rollDiceAction();
  };

  const dieFaces: Record<number, string> = {
    1: "⚀",
    2: "⚁",
    3: "⚂",
    4: "⚃",
    5: "⚄",
    6: "⚅",
  };

  const renderDie = (value: number, index: number) => (
    <motion.div
      key={index}
      animate={{
        rotateX: rolling ? [0, 360, 720, 1080] : 0,
        rotateY: rolling ? [0, 180, 360, 540] : 0,
        scale: rolling ? [1, 1.1, 1, 1.1, 1] : 1,
      }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
      }}
      style={{
        width: "70px",
        height: "70px",
        backgroundColor: "var(--ivory)",
        border: "2px solid var(--gold-dark)",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "64px",
        color: "var(--obsidian)",
        lineHeight: 1,
        boxShadow: rolling 
          ? "0 10px 30px rgba(212,175,55,0.4)" 
          : "inset 0 0 10px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.5)",
        transformStyle: "preserve-3d",
      }}
    >
      {dieFaces[value] || value}
    </motion.div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <div style={{ display: "flex", gap: "20px" }}>
        {renderDie(displayDie1, 0)}
        {renderDie(displayDie2, 1)}
      </div>
      
      {finalRoll && !rolling && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: "22px",
            fontFamily: "var(--font-heading)",
            color: finalRoll.isDoubles ? "var(--gold-primary)" : "var(--ivory)",
            marginTop: "12px",
            letterSpacing: "2px",
            textTransform: "uppercase"
          }}
        >
          {finalRoll.isDoubles 
            ? `DOUBLES: ${finalRoll.total}` 
            : `ROLL: ${finalRoll.total}`}
        </motion.div>
      )}
      
      {rolling && (
        <div style={{ color: "var(--gold-dark)", fontSize: "14px", letterSpacing: "2px" }}>
          CASTING DICE...
        </div>
      )}
    </div>
  );
};

// Compact dice display for showing last roll
export const DiceDisplay: React.FC = () => {
  const diceRoll = useGameStore((s) => s.diceRoll);
  
  if (!diceRoll) return null;

  const dieFaces: Record<number, string> = {
    1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅",
  };

  return (
    <motion.div
      className="deco-border"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 24px",
        backgroundColor: "var(--charcoal)",
        borderRadius: "2px",
      }}
    >
      <span style={{ fontSize: "36px", color: "var(--ivory)", lineHeight: 1 }}>{dieFaces[diceRoll.die1]}</span>
      <span style={{ fontSize: "36px", color: "var(--ivory)", lineHeight: 1 }}>{dieFaces[diceRoll.die2]}</span>
      <span style={{ 
        fontSize: "18px", 
        fontFamily: "var(--font-heading)",
        color: diceRoll.isDoubles ? "var(--gold-primary)" : "var(--ivory)",
        marginLeft: "12px",
        letterSpacing: "1px"
      }}>
        = {diceRoll.total}
        {diceRoll.isDoubles && " (DOUBLES)"}
      </span>
    </motion.div>
  );
};
