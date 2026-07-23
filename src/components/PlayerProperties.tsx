import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { useLocalStore } from "../store/localStore";
import type { Player, Property, TradeOffer } from "../types/game";

const COLOR_MAP: Record<string, string> = {
  brown: "var(--prop-brown)",
  light_blue: "var(--prop-lightblue)",
  pink: "var(--prop-pink)",
  orange: "var(--prop-orange)",
  red: "var(--prop-red)",
  yellow: "var(--prop-yellow)",
  green: "var(--prop-green)",
  dark_blue: "var(--prop-darkblue)",
};

interface PlayerPropertiesPanelProps {
  playerIndex: number;
}

export const PlayerPropertiesPanel = ({ playerIndex }: PlayerPropertiesPanelProps) => {
  const { 
    players, 
    spaces, 
    currentPlayerIndex, 
    buildHouse, 
    buildHotel, 
    sellHouse, 
    sellHotel, 
    mortgageProperty, 
    unmortgageProperty,
    startTrade,
    hasMonopoly
  } = useGameStore();
  
  const { myPlayerIndex } = useLocalStore();
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  
  const player = players[playerIndex];
  const isYourTurn = currentPlayerIndex === playerIndex;
  const isYou = myPlayerIndex === playerIndex;

  if (!player) return null;

  // Get all properties owned by this player
  const ownedProperties = spaces.filter(
    (s): s is Property =>
      (s.type === "property" || s.type === "railroad" || s.type === "utility") &&
      (s as Property).owner === playerIndex
  ) as Property[];

  // Group properties by color
  const groupedProperties: Record<string, Property[]> = {};
  ownedProperties.forEach((prop) => {
    const key = prop.colorGroup ?? (prop.type === "railroad" ? "railroad" : "utility");
    if (!groupedProperties[key]) {
      groupedProperties[key] = [];
    }
    groupedProperties[key].push(prop);
  });

  const handlePropertyClick = (propId: number) => {
    if (!isYou) return;
    setSelectedPropertyId(selectedPropertyId === propId ? null : propId);
  };

  const handleTradeClick = () => {
    if (myPlayerIndex === null || myPlayerIndex === playerIndex) return;
    startTrade(myPlayerIndex, playerIndex);
  };

  const selectedProperty = selectedPropertyId !== null 
    ? spaces.find(s => s.id === selectedPropertyId) as Property 
    : null;

  const canBuild = selectedProperty && 
                  selectedProperty.type === "property" && 
                  selectedProperty.colorGroup &&
                  hasMonopoly(playerIndex, selectedProperty.colorGroup) &&
                  !selectedProperty.mortgaged;

  // Calculate exact height based on content
  // Header: 65px (36px avatar + padding/border)
  // Each property group header: 24px
  // Each property row: 32px
  // Gap between groups: 8px
  // Management panel (if selected): 200px
  const propertyGroupCount = Object.keys(groupedProperties).length;
  const propertiesPerGroup = Object.values(groupedProperties).reduce((acc, props) => acc + props.length, 0);
  
  const headerHeight = 50;
  const groupHeaderHeight = 20;
  const propertyRowHeight = 26;
  const groupGap = 6;
  const managementPanelHeight = selectedProperty ? 150 : 0;
  const paddingAndBorders = 20;
  
  const propertiesHeight = (propertyGroupCount * groupHeaderHeight) + (propertiesPerGroup * propertyRowHeight) + (Math.max(0, propertyGroupCount - 1) * groupGap);
  const totalHeight = headerHeight + Math.max(propertiesHeight, 30) + managementPanelHeight + paddingAndBorders;
  
  return (
    <div
      style={{
        background: isYourTurn 
          ? "linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.02))"
          : "var(--card-bg)",
        borderRadius: "2px",
        padding: "12px",
        boxShadow: isYourTurn 
          ? "0 0 30px rgba(212,175,55,0.2), 0 8px 32px rgba(0,0,0,0.8)"
          : "0 8px 32px rgba(0,0,0,0.8)",
        border: isYourTurn ? `2px solid var(--gold-primary)` : "1px solid var(--gold-dark)",
        transition: "all 0.3s",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        position: "relative",
        flex: "0 0 auto",
        height: `${totalHeight}px`,
        overflow: "hidden"
      }}
    >
      {/* Current turn indicator bar */}
      {isYourTurn && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.5 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "3px",
            background: "linear-gradient(90deg, var(--gold-primary), var(--gold-light), var(--gold-primary))",
            boxShadow: "0 0 10px var(--gold-primary)"
          }}
        />
      )}
      {/* Player Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          paddingBottom: "8px",
          borderBottom: "1px solid var(--gold-dark)",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: `radial-gradient(circle at 30% 30%, var(--gold-light), ${player.color}, var(--obsidian))`,
            border: "2px solid var(--gold-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
            boxShadow: isYourTurn ? `0 0 12px rgba(212,175,55,0.4)` : "inset 0 2px 5px rgba(255,255,255,0.4)",
          }}
        >
          {player.token}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: "var(--ivory)",
              fontWeight: 500,
              fontSize: "13px",
              fontFamily: "var(--font-heading)",
              letterSpacing: "1px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textTransform: "uppercase"
            }}
          >
            {player.name}
            {player.bankrupt && (
              <span style={{ color: "var(--ruby)", fontSize: "9px", letterSpacing: "1px" }}>BANKRUPT</span>
            )}
            {isYourTurn && !isYou && (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ 
                  color: "var(--gold-primary)", 
                  fontSize: "8px", 
                  letterSpacing: "1px",
                  background: "rgba(212,175,55,0.2)",
                  padding: "1px 4px",
                  borderRadius: "2px"
                }}
              >
                TURN
              </motion.span>
            )}
          </div>
          <div style={{ color: "var(--gold-primary)", fontSize: "15px", fontWeight: 600, fontFamily: "var(--font-body)", letterSpacing: "1px" }}>
            £{player.cash.toLocaleString()}
          </div>
        </div>
        
        {/* Trade Button - Only show if not your panel and you are logged in */}
        {!isYou && !player.bankrupt && myPlayerIndex !== null && (
          <motion.button
            className="button"
            onClick={handleTradeClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "4px 8px",
              fontSize: "9px",
              minWidth: "auto"
            }}
          >
            TRADE
          </motion.button>
        )}
      </div>

      {/* Properties List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "0 0 auto" }}>
        {Object.entries(groupedProperties).map(([colorGroup, properties]) => {
          const bgColor = COLOR_MAP[colorGroup] ?? (colorGroup === "railroad" ? "var(--charcoal)" : "var(--obsidian)");
          const isMonopoly =
            colorGroup !== "railroad" &&
            colorGroup !== "utility" &&
            spaces.filter(
              (s) =>
                s.type === "property" &&
                (s as Property).colorGroup === colorGroup
            ).length === properties.length;

          return (
            <div key={colorGroup}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "1px", background: bgColor, border: isMonopoly ? "1px solid var(--gold-primary)" : "1px solid var(--charcoal)", boxShadow: isMonopoly ? "0 0 4px var(--gold-primary)" : "none" }} />
                <span style={{ fontSize: "9px", color: "var(--ivory-dark)", fontFamily: "var(--font-heading)", letterSpacing: "1px", textTransform: "uppercase" }}>{colorGroup.replace("_", " ")}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px", paddingLeft: "16px" }}>
                {properties.map((prop) => (
                  <motion.div
                    key={prop.id}
                    onClick={() => handlePropertyClick(prop.id)}
                    whileHover={isYou ? { x: 4, background: "rgba(212,175,55,0.1)" } : {}}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "4px 8px",
                      borderRadius: "2px",
                      background: selectedPropertyId === prop.id 
                        ? "rgba(212,175,55,0.2)" 
                        : prop.mortgaged ? "rgba(122,16,16,0.2)" : "transparent",
                      cursor: isYou ? "pointer" : "default",
                      border: selectedPropertyId === prop.id ? "1px solid var(--gold-primary)" : "1px solid var(--charcoal)",
                      borderLeft: prop.mortgaged ? "2px solid var(--ruby)" : (selectedPropertyId === prop.id ? "2px solid var(--gold-primary)" : "2px solid transparent")
                    }}
                  >
                    <span style={{ fontSize: "10px", fontFamily: "var(--font-body)", color: prop.mortgaged ? "var(--ruby)" : "var(--ivory)", textDecoration: prop.mortgaged ? "line-through" : "none", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>
                      {prop.name}
                    </span>
                    <div style={{ display: "flex", gap: "3px", color: "var(--gold-primary)" }}>
                      {prop.hotel && <span style={{ filter: "grayscale(100%) sepia(100%) hue-rotate(10deg) saturate(500%)", fontSize: "10px" }}>🏨</span>}
                      {!prop.hotel && prop.houses > 0 && <span style={{ fontSize: "9px", filter: "grayscale(100%) sepia(100%) hue-rotate(10deg) saturate(500%)" }}>{prop.houses}🏠</span>}
                      {prop.mortgaged && <span style={{ color: "var(--ruby)", fontSize: "8px", fontWeight: "bold" }}>M</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Property Management Panel */}
      <AnimatePresence>
        {isYou && selectedProperty && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: "var(--obsidian)",
              border: "1px solid var(--gold-dark)",
              borderRadius: "2px",
              padding: "10px",
              marginTop: "6px",
              overflow: "hidden",
            }}
          >
            <div style={{ fontSize: "12px", fontFamily: "var(--font-heading)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", textAlign: "center", color: "var(--gold-primary)" }}>
              Manage: {selectedProperty.name}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {/* Build Button */}
              {canBuild && !selectedProperty.hotel && (
                <button
                  className="button action-button"
                  onClick={() => selectedProperty.houses === 4 ? buildHotel(selectedProperty.id) : buildHouse(selectedProperty.id)}
                  disabled={player.cash < (selectedProperty.buildingCost ?? 0)}
                  style={{ padding: "6px", fontSize: "9px", gridColumn: "span 2" }}
                >
                  {selectedProperty.houses === 4 ? "Build Hotel" : `Build House (£${selectedProperty.buildingCost})`}
                </button>
              )}
              
              {/* Sell Button */}
              {(selectedProperty.houses > 0 || selectedProperty.hotel) && (
                <button
                  className="button"
                  onClick={() => selectedProperty.hotel ? sellHotel(selectedProperty.id) : sellHouse(selectedProperty.id)}
                  style={{ padding: "6px", fontSize: "9px", borderColor: "var(--ruby)", color: "var(--ruby)", gridColumn: "span 2" }}
                >
                  Sell {selectedProperty.hotel ? "Hotel" : "House"}
                </button>
              )}

              {/* Mortgage Button */}
              <button
                className="button"
                onClick={() => selectedProperty.mortgaged ? unmortgageProperty(selectedProperty.id) : mortgageProperty(selectedProperty.id)}
                disabled={!selectedProperty.mortgaged && (selectedProperty.houses > 0 || selectedProperty.hotel)}
                style={{
                  padding: "6px",
                  fontSize: "9px",
                  gridColumn: "span 2",
                  color: selectedProperty.mortgaged ? "var(--gold-primary)" : "var(--ruby)",
                  borderColor: selectedProperty.mortgaged ? "var(--gold-primary)" : "var(--ruby)"
                }}
              >
                {selectedProperty.mortgaged 
                  ? `Unmortgage (£${Math.floor(selectedProperty.mortgageValue * 1.1)})` 
                  : `Mortgage (+£${selectedProperty.mortgageValue})`}
              </button>
            </div>
            {!selectedProperty.mortgaged && (selectedProperty.houses > 0 || selectedProperty.hotel) && !selectedProperty.mortgaged && (
              <div style={{ fontSize: "9px", color: "var(--gold-dark)", marginTop: "6px", textAlign: "center", letterSpacing: "0.5px" }}>
                MUST SELL BUILDINGS FIRST
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerPropertiesPanel;
