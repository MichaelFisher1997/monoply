import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import type { Property } from "../types/game";

const SPACE_SIZE = 80;
const BOARD_SIZE = 11;
const BOARD_PADDING = 20;

const getSpacePosition = (index: number) => {
  if (index === 0) return { row: 10, col: 10 }; // GO - bottom right
  if (index <= 9) return { row: 10, col: 10 - index }; // Bottom row (right to left)
  if (index === 10) return { row: 10, col: 0 }; // Jail - bottom left
  if (index <= 19) return { row: 10 - (index - 10), col: 0 }; // Left column (bottom to top)
  if (index === 20) return { row: 0, col: 0 }; // Free Parking - top left
  if (index <= 29) return { row: 0, col: index - 20 }; // Top row (left to right)
  if (index === 30) return { row: 0, col: 10 }; // Go To Jail - top right
  return { row: index - 30, col: 10 }; // Right column (top to bottom)
};

// Export for PlayerToken to use
export { getSpacePosition, SPACE_SIZE, BOARD_PADDING };

const getColorForSpace = (space: { type: string; colorGroup?: string | null }): string => {
  if (space.type === "railroad") return "var(--charcoal)";
  if (space.type === "utility") return "var(--charcoal)";
  if (space.type === "property" && space.colorGroup) {
    const colors: Record<string, string> = {
      brown: "var(--prop-brown)",
      light_blue: "var(--prop-lightblue)",
      pink: "var(--prop-pink)",
      orange: "var(--prop-orange)",
      red: "var(--prop-red)",
      yellow: "var(--prop-yellow)",
      green: "var(--prop-green)",
      dark_blue: "var(--prop-darkblue)",
    };
    return colors[space.colorGroup] || "var(--ivory-dark)";
  }
  if (space.type === "go") return "var(--gold-dark)";
  if (space.type === "jail") return "var(--charcoal)";
  if (space.type === "go_to_jail") return "var(--ruby)";
  if (space.type === "free_parking") return "var(--gold-primary)";
  if (space.type === "tax") return "var(--ruby)";
  if (space.type === "chance" || space.type === "community_chest") return "var(--gold-primary)";
  return "var(--ivory)";
};

const getSpaceIcon = (space: { type: string; name: string }) => {
  if (space.type === "railroad") return "🚂";
  if (space.type === "utility") return space.name.includes("Water") ? "💧" : "💡";
  if (space.type === "chance") return "❓";
  if (space.type === "community_chest") return "📦";
  if (space.type === "go") return "🏁";
  if (space.type === "jail") return "🔒";
  if (space.type === "go_to_jail") return "👮";
  if (space.type === "free_parking") return "🚗";
  if (space.type === "tax") return "💰";
  return null;
};

const Space = ({ space, onClick }: { space: { id: number; name: string; type: string; colorGroup?: string | null }; onClick: (spaceId: number) => void; }) => {
  const pos = getSpacePosition(space.id);
  const spaces = useGameStore((s) => s.spaces);
  const property = spaces.find((s) => s.id === space.id) as Property | undefined;
  
  const icon = getSpaceIcon(space);
  const isPropertyType = space.type === "property";
  const color = getColorForSpace(space);

  return (
    <motion.div
      onClick={() => onClick(space.id)}
      className={`space space-${space.type}`}
      style={{
        position: "absolute",
        width: SPACE_SIZE,
        height: SPACE_SIZE,
        left: pos.col * (SPACE_SIZE + 4) + BOARD_PADDING,
        top: pos.row * (SPACE_SIZE + 4) + BOARD_PADDING,
        backgroundColor: isPropertyType ? "var(--ivory)" : (space.type === "go" || space.type === "free_parking" ? "var(--charcoal)" : "var(--ivory-dark)"),
        border: "1px solid var(--gold-dark)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: isPropertyType ? "flex-start" : "center",
        fontSize: "9px",
        fontFamily: "var(--font-heading)",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        fontWeight: "bold",
        color: space.type === "go" || space.type === "free_parking" ? "var(--gold-primary)" : "var(--obsidian)",
        borderRadius: "0",
        textAlign: "center",
        overflow: "hidden",
        boxShadow: "inset 0 0 5px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.5)",
        cursor: "pointer",
      }}
      whileHover={{ scale: 1.05, zIndex: 10, boxShadow: "0 0 15px var(--gold-primary)" }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Property Color Bar */}
      {isPropertyType && (
        <div
          style={{
            width: "100%",
            height: "22%",
            backgroundColor: color,
            borderBottom: "2px solid var(--gold-dark)",
            marginBottom: "4px",
            position: "relative",
            boxShadow: "inset 0 -2px 5px rgba(0,0,0,0.2)"
          }}
        >
          {/* Houses / Hotel */}
          {property && (property.houses > 0 || property.hotel) && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              gap: "2px",
              zIndex: 5
            }}>
              {property.hotel ? (
                <span style={{ fontSize: "10px", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.5))" }}>🏨</span>
              ) : (
                Array.from({ length: property.houses }).map((_, i) => (
                  <span key={i} style={{ fontSize: "8px", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.5))" }}>🏠</span>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "2px",
        width: "100%"
      }}>
        {/* Icon for non-properties */}
        {icon && !isPropertyType && (
          <div style={{ fontSize: "24px", marginBottom: "4px", color: space.type === "go" ? "var(--gold-primary)" : "inherit" }}>{icon}</div>
        )}
        
        <div style={{ lineHeight: 1.1, fontSize: isPropertyType ? "8px" : "9px", color: space.type === "go" || space.type === "free_parking" ? "var(--gold-primary)" : "inherit" }}>{space.name}</div>
        
        {/* Price or Icon for properties */}
        {property && (property.type === "property" || property.type === "railroad" || property.type === "utility") && (
          <div style={{ fontSize: "8px", marginTop: "2px", fontWeight: "normal", color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>£{property.price}</div>
        )}
        
        {/* Icon for properties (railroads/utilities) handled above, but maybe add small icons for properties? */}
        {icon && isPropertyType && (
           <div style={{ fontSize: "12px", marginTop: "2px" }}>{icon}</div>
        )}
      </div>
    </motion.div>
  );
};

export const Board = ({ onSpaceClick }: { onSpaceClick?: (spaceId: number) => void }) => {
  const spaces = useGameStore((s) => s.spaces);
  
  const boardWidth = BOARD_SIZE * (SPACE_SIZE + 4) + BOARD_PADDING * 2;
  const boardHeight = BOARD_SIZE * (SPACE_SIZE + 4) + BOARD_PADDING * 2;

  return (
    <div
      id="game-board"
      style={{
        position: "relative",
        width: boardWidth + 16, // Add border width
        height: boardHeight + 16,
        backgroundColor: "var(--emerald)", 
        backgroundImage: "radial-gradient(circle at center, var(--emerald) 0%, var(--emerald-dark) 100%)",
        borderRadius: "4px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), inset 0 0 0 4px var(--gold-dark), inset 0 0 0 6px var(--obsidian)",
        flexShrink: 0,
        border: "8px solid var(--charcoal)",
        boxSizing: "border-box",
      }}
    >
      {/* Decorative center background elements */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.05, backgroundImage: "linear-gradient(var(--gold-primary) 1px, transparent 1px), linear-gradient(90deg, var(--gold-primary) 1px, transparent 1px)", backgroundSize: "40px 40px", zIndex: 0 }} />

      {/* Decorative corners */}
      <div style={{ position: "absolute", top: 4, left: 4, width: 20, height: 20, borderTop: "2px solid var(--gold-primary)", borderLeft: "2px solid var(--gold-primary)" }} />
      <div style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderTop: "2px solid var(--gold-primary)", borderRight: "2px solid var(--gold-primary)" }} />
      <div style={{ position: "absolute", bottom: 4, left: 4, width: 20, height: 20, borderBottom: "2px solid var(--gold-primary)", borderLeft: "2px solid var(--gold-primary)" }} />
      <div style={{ position: "absolute", bottom: 4, right: 4, width: 20, height: 20, borderBottom: "2px solid var(--gold-primary)", borderRight: "2px solid var(--gold-primary)" }} />

      {/* Render spaces */}
      {spaces.map((space) => (
        <Space
          key={space.id}
          space={space}
          onClick={(id) => onSpaceClick?.(id)}
        />
      ))}

      {/* Center board area - Monopoly Logo */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-45deg)",
          transformOrigin: "center center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          userSelect: "none",
          textAlign: "center",
          border: "2px double var(--gold-dark)",
          padding: "30px 50px",
          borderRadius: "2px",
          boxShadow: "inset 0 0 20px rgba(212,175,55,0.2), 0 0 30px rgba(0,0,0,0.5)",
          backgroundColor: "rgba(10, 10, 12, 0.6)",
          backdropFilter: "blur(4px)",
          minWidth: "400px"
        }}
      >
        <div style={{
          fontSize: "64px",
          fontFamily: "var(--font-heading)",
          fontWeight: "700",
          color: "transparent",
          background: "var(--gold-metallic)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          letterSpacing: "12px",
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          lineHeight: "1"
        }}>
          THE GRAND
        </div>
        <div style={{ 
          fontSize: "24px", 
          letterSpacing: "12px", 
          color: "var(--gold-light)", 
          marginTop: "16px", 
          textShadow: "none", 
          WebkitTextFillColor: "var(--gold-light)",
          fontFamily: "var(--font-body)",
          fontWeight: "400"
        }}>
          MONOPOLY
        </div>
      </div>
    </div>
  );
};
