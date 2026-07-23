import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Property, Space } from "../types/game";
import { useGameStore } from "../store/gameStore";

interface PropertyCardProps {
  space: Space;
  onClose: () => void;
}

export const PropertyCard = ({ space, onClose }: PropertyCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const players = useGameStore(s => s.players);

  const isProperty = space.type === "property" || space.type === "railroad" || space.type === "utility";
  const property = space as Property;
  const owner = property.owner !== undefined ? players[property.owner] : null;

  const getColorHex = (colorGroup?: string | null) => {
    if (space.type === "railroad") return "var(--charcoal)";
    if (space.type === "utility") return "var(--charcoal)";
    if (!colorGroup) return "var(--gold-dark)";
    
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
    return colors[colorGroup] || "var(--gold-dark)";
  };

  const getIcon = () => {
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        background: "rgba(10, 10, 12, 0.8)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div 
        style={{ perspective: "1000px", width: "320px", height: "480px", position: "relative" }}
        onClick={(e) => {
          e.stopPropagation();
          setIsFlipped(!isFlipped);
        }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            cursor: "pointer",
          }}
        >
          {/* FRONT OF CARD */}
          <div
            className="deco-border"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              background: "var(--ivory)",
              display: "flex",
              flexDirection: "column",
              color: "var(--obsidian)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              padding: "16px",
              boxSizing: "border-box"
            }}
          >
            {isProperty ? (
              <>
                <div style={{
                  background: getColorHex(property.colorGroup),
                  border: "2px solid var(--obsidian)",
                  padding: "16px 8px",
                  textAlign: "center",
                  color: "white",
                  marginBottom: "16px",
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.3)"
                }}>
                  <div style={{ fontSize: "10px", fontFamily: "var(--font-heading)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
                    Title Deed
                  </div>
                  <div style={{ fontSize: "20px", fontFamily: "var(--font-heading)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", lineHeight: 1.2 }}>
                    {space.name}
                  </div>
                </div>

                <div style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: "8px", fontFamily: "var(--font-body)", fontSize: "14px", textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "var(--obsidian)", marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid var(--charcoal)" }}>
                    Price £{property.price}
                  </div>
                  {space.type === "property" && property && property.rents ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span>Rent</span>
                        <strong>£{property.rents[0]}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>With 1 House</span>
                        <strong>£{property.rents[1]}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>With 2 Houses</span>
                        <strong>£{property.rents[2]}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>With 3 Houses</span>
                        <strong>£{property.rents[3]}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>With 4 Houses</span>
                        <strong>£{property.rents[4]}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--charcoal)" }}>
                        <span>With HOTEL</span>
                        <strong>£{property.rents[5]}</strong>
                      </div>

                      <div style={{ marginTop: "auto", fontSize: "12px", borderTop: "1px solid var(--charcoal)", paddingTop: "12px", textAlign: "left", display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Mortgage Value</span>
                          <span>£{property.mortgageValue}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Houses cost</span>
                          <span>£{property.buildingCost} each</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Hotels, £{property.buildingCost} plus 4 houses</span>
                        </div>
                      </div>
                    </>
                  ) : space.type === "railroad" && property ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
                      <div style={{ fontSize: "48px", marginBottom: "4px" }}>🚂</div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Rent</span>
                        <strong>£25</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>If 2 R.R.'s are owned</span>
                        <strong>£50</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>If 3 R.R.'s are owned</span>
                        <strong>£100</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>If 4 R.R.'s are owned</span>
                        <strong>£200</strong>
                      </div>
                      
                      <div style={{ marginTop: "auto", fontSize: "12px", borderTop: "1px solid var(--charcoal)", paddingTop: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Mortgage Value</span>
                          <span>£{property.mortgageValue}</span>
                        </div>
                      </div>
                    </div>
                  ) : space.type === "utility" && property ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
                      <div style={{ fontSize: "48px", marginBottom: "4px" }}>
                        {space.name.includes("Water") ? "💧" : "💡"}
                      </div>
                      <div style={{ textAlign: "justify", fontSize: "12px", lineHeight: "1.5" }}>
                        If one "Utility" is owned rent is 4 times amount shown on dice.
                        <br/><br/>
                        If both "Utilities" are owned rent is 10 times amount shown on dice.
                      </div>
                      
                      <div style={{ marginTop: "auto", fontSize: "12px", borderTop: "1px solid var(--charcoal)", paddingTop: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Mortgage Value</span>
                          <span>£{property.mortgageValue}</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "24px" }}>
                <div style={{ fontSize: "64px", marginBottom: "24px" }}>{getIcon()}</div>
                <h2 style={{ fontSize: "28px", fontFamily: "var(--font-heading)", textTransform: "uppercase", letterSpacing: "2px", color: "var(--obsidian)", marginBottom: "16px" }}>{space.name}</h2>
                <div style={{ width: "40px", height: "2px", background: "var(--gold-dark)", margin: "0 auto 16px auto" }} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--charcoal)", fontStyle: "italic" }}>
                  {space.type === "tax" ? "Pay the required tax to the bank." : 
                   space.type === "chance" || space.type === "community_chest" ? "Draw a card and follow its instructions." :
                   space.type === "go_to_jail" ? "Move directly to Jail. Do not pass GO." :
                   "A safe resting place."}
                </p>
              </div>
            )}
            
            <div style={{ position: "absolute", bottom: "8px", left: "0", width: "100%", textAlign: "center", fontSize: "10px", color: "var(--gold-dark)", fontStyle: "italic", letterSpacing: "1px" }}>
              Tap to flip
            </div>
          </div>

          {/* BACK OF CARD (Ownership Info) */}
          <div
            className="deco-border"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              background: "var(--obsidian)",
              transform: "rotateY(180deg)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              padding: "24px",
              boxSizing: "border-box"
            }}
          >
            <h3 className="deco-title" style={{ fontSize: "24px", borderBottom: "1px solid var(--gold-dark)", paddingBottom: "16px", marginBottom: "24px" }}>
              Property Details
            </h3>

            {isProperty ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--gold-dark)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Owner</div>
                  {owner ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: owner.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", border: "1px solid var(--gold-primary)" }}>
                        {owner.token}
                      </div>
                      <span style={{ fontSize: "18px", color: "var(--ivory)", fontFamily: "var(--font-heading)", letterSpacing: "1px" }}>{owner.name}</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: "18px", color: "var(--ivory-dark)", fontStyle: "italic" }}>Unowned (Available for £{property.price})</div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--gold-dark)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Status</div>
                    <div style={{ fontSize: "16px", color: property.mortgaged ? "var(--ruby)" : "var(--emerald)", fontWeight: "bold", letterSpacing: "1px" }}>
                      {property.mortgaged ? "MORTGAGED" : "ACTIVE"}
                    </div>
                  </div>

                  {property.type === "property" && (
                    <div>
                      <div style={{ fontSize: "12px", color: "var(--gold-dark)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Development</div>
                      <div style={{ fontSize: "16px", color: "var(--ivory)" }}>
                        {property.hotel ? "1 Hotel 🏨" : 
                         property.houses > 0 ? `${property.houses} Houses 🏠` : 
                         "No buildings"}
                      </div>
                    </div>
                  )}
                </div>

                {property.type === "property" 
                && property.rents 
                && (
                  <div style={{ marginTop: "16px", borderTop: "2px solid var(--gold-dark)", paddingTop: "16px" }}>
                    <div style={{ fontSize: "12px", color: "var(--gold-primary)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "12px", textAlign: "center", fontWeight: "bold" }}>
                      Current Rent
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(212,175,55,0.1)", borderRadius: "4px", marginBottom: "16px" }}>
                      <span style={{ color: "var(--ivory-dark)", fontSize: "14px" }}>
                        {property.mortgaged ? "Mortgaged (No rent)" : property.hotel ? "With Hotel" : property.houses > 0 ? `With ${property.houses} House${property.houses > 1 ? 's' : ''}` : "Base Rent"}
                      </span>
                      <strong style={{ color: property.mortgaged ? "var(--ruby)" : "var(--gold-primary)", fontSize: "20px" }}>
                        £{property.mortgaged ? 0 : property.hotel ? property.rents[5] : property.rents[property.houses]}
                      </strong>
                    </div>

                    <div style={{ paddingTop: "12px", borderTop: "1px solid var(--gold-dark)", display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontFamily: "var(--font-body)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--gold-dark)" }}>Mortgage Value</span>
                        <span style={{ color: "var(--ivory)" }}>£{property.mortgageValue}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--gold-dark)" }}>Houses cost</span>
                        <span style={{ color: "var(--ivory)" }}>£{property.buildingCost} each</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--gold-dark)" }}>Hotels, £{property.buildingCost} plus 4 houses</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-dark)", fontStyle: "italic", textAlign: "center", padding: "20px" }}>
                Public property. Cannot be owned or developed.
              </div>
            )}

            <div style={{ position: "absolute", bottom: "8px", left: "0", width: "100%", textAlign: "center", fontSize: "10px", color: "var(--gold-dark)", fontStyle: "italic", letterSpacing: "1px" }}>
              Tap to flip
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
