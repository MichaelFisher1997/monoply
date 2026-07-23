import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { useGameStore } from "./store/gameStore";
import { Board } from "./components/Board";
import { MultiplayerLobby } from "./components/MultiplayerLobby";
import { ServerBrowser } from "./components/ServerBrowser";
import { PlayerTokens } from "./components/PlayerToken";
import PlayerSetup from "./components/PlayerSetup";
import { AuctionModal } from "./components/AuctionModal";
import { TradeModal } from "./components/TradeModal";
import { Dice, DiceDisplay } from "./components/Dice";
import { GameLog } from "./components/GameLog";
import { PlayerPropertiesPanel } from "./components/PlayerProperties";
import { PlayerSelectionModal } from "./components/PlayerSelectionModal";
import { PropertyCard } from "./components/PropertyCard";
import { TurnStats } from "./components/TurnStats";
import { PlayerSummaryCard } from "./components/PlayerSummaryCard";
import { useLocalStore } from "./store/localStore";
import type { Property, Space } from "./types/game";

const isProperty = (space: { type: string }): space is Property => {
  return space.type === "property" || space.type === "railroad" || space.type === "utility";
};

const BoardZoomWrapper = ({ children }: { children: React.ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8); // Initial scale
  const springScale = useSpring(scale, { stiffness: 300, damping: 30 });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    
    setScale((prevScale) => {
      let newScale = prevScale;
      if (e.deltaY < 0) {
        newScale = Math.min(prevScale + zoomFactor, 2); // Max zoom in
      } else {
        newScale = Math.max(prevScale - zoomFactor, 0.4); // Max zoom out
      }
      return newScale;
    });
  };

  React.useEffect(() => {
    springScale.set(scale);
  }, [scale, springScale]);

  return (
    <motion.div
      ref={containerRef}
      onWheel={handleWheel}
      style={{
        scale: springScale,
        transformOrigin: "center center",
        position: "relative",
      }}
    >
      {children}
    </motion.div>
  );
};

export default function App() {
  const { 
    phase, 
    diceRoll, 
    currentPlayerIndex, 
    players, 
    passedGo: storePassedGo, 
    winner,
    spaces,
    auction,
    trade,
    lastCardDrawn,
    connect,
    connected,
    inRoom,
    leaveRoom,
  } = useGameStore();
  const { myPlayerIndex, turnStats, startTurnStats, recordDiceRoll, recordSpaceLanded, recordMoneyChange, endTurnStats } = useLocalStore();
  
  const currentPlayer = currentPlayerIndex !== undefined && currentPlayerIndex < players.length 
    ? players[currentPlayerIndex] 
    : null;
  
  const isMyTurn = currentPlayerIndex === myPlayerIndex;
  
  const currentSpace = currentPlayer ? spaces[currentPlayer.position] : null;

  const [passedGo, setPassedGo] = React.useState(false);
  const prevCashRef = React.useRef<number>(0);
  
  React.useEffect(() => {
    connect();
  }, []);

  // Turn stats tracking - start when it becomes your turn
  const turnFromStore = useGameStore((state) => state.turn);
  
  React.useEffect(() => {
    if (isMyTurn && currentPlayer && phase !== "setup" && phase !== "lobby") {
      const turnNumber = useGameStore.getState().turn;
      // Check if we already have active stats for this turn
      if (!turnStats || !turnStats.isActive || turnStats.playerIndex !== myPlayerIndex || turnStats.turnNumber !== turnNumber) {
        startTurnStats(turnNumber, myPlayerIndex, currentPlayer.cash);
        prevCashRef.current = currentPlayer.cash;
      }
    }
  }, [isMyTurn, myPlayerIndex, phase, turnFromStore]);

  // Track dice roll
  React.useEffect(() => {
    if (isMyTurn && diceRoll && turnStats?.isActive) {
      recordDiceRoll(diceRoll);
    }
  }, [diceRoll, isMyTurn]);

  // Track space landed
  React.useEffect(() => {
    if (isMyTurn && currentSpace && phase === "resolving_space" && turnStats?.isActive) {
      recordSpaceLanded(currentSpace.name);
    }
  }, [currentSpace?.name, phase, isMyTurn]);



  // Track each individual cash change (rent, purchases, passing GO, etc.)
  React.useEffect(() => {
    if (isMyTurn && currentPlayer && turnStats?.isActive) {
      const currentCash = currentPlayer.cash;
      const prevCash = prevCashRef.current;
      const cashDiff = currentCash - prevCash;

      if (cashDiff !== 0 && prevCash !== 0) {
        // Record this individual transaction amount
        recordMoneyChange(cashDiff);
      }

      prevCashRef.current = currentCash;
    }
  }, [currentPlayer?.cash, isMyTurn]);
  const [isRolling, setIsRolling] = React.useState(false);
  const [inspectedSpaceId, setInspectedSpaceId] = React.useState<number | null>(null);
  const [isOpponentsCompact, setIsOpponentsCompact] = React.useState(true);

  React.useEffect(() => {
    if (storePassedGo) {
      setPassedGo(true);
      setTimeout(() => {
        setPassedGo(false);
      }, 2000);
    }
  }, [storePassedGo]);

  // Reset isRolling when diceRoll is cleared (e.g., after doubles or turn end)
  React.useEffect(() => {
    if (!diceRoll) {
      setIsRolling(false);
    }
  }, [diceRoll]);

  // AI turn execution
  React.useEffect(() => {
    if (!connected) return; // Wait for connection
    if (!currentPlayer || !currentPlayer.isAI || currentPlayer.bankrupt) return;
    if (phase === "setup" || phase === "game_over") return;

    // Add delay for AI actions to be visible
    const aiDelay = setTimeout(() => {
      useGameStore.getState().executeAITurn();
    }, 1200);

    return () => clearTimeout(aiDelay);
  }, [currentPlayer, phase, auction?.activePlayerIndex, connected]);

  // AI trade response
  React.useEffect(() => {
    console.log("AI trade response effect:", { phase, tradeStatus: trade?.status, connected });
    if (!connected) return;
    if (phase === "trading" && trade?.status === "pending") {
      const receiver = players[trade.offer.toPlayer];
      console.log("Trade pending, receiver:", receiver?.name, "isAI:", receiver?.isAI);
      if (receiver?.isAI) {
        console.log("Scheduling AI response...");
        const aiDelay = setTimeout(() => {
          console.log("Executing AI trade response");
          useGameStore.getState().executeAITradeResponse();
        }, 2000);
        return () => clearTimeout(aiDelay);
      }
    }
  }, [phase, trade?.status, connected, trade?.offer?.toPlayer]);

  const handleRollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
  };

  const handleRollComplete = () => {
    const roll = useGameStore.getState().diceRoll;
    
    // Keep showing dice for a moment after roll completes
    setTimeout(() => {
      setIsRolling(false);
      
      if (roll && currentPlayer && !currentPlayer.inJail) {
        // Move the player after a short delay
        setTimeout(() => {
          useGameStore.getState().movePlayer(currentPlayerIndex, roll.total);
        }, 200);
      }
    }, 800);
  };

  const handleEndTurn = () => {
    setIsRolling(false); // Reset rolling state when ending turn (especially for doubles)
    useGameStore.getState().endTurn();
  };

  const handleBuyProperty = () => {
    if (!currentSpace || !isProperty(currentSpace)) return;
    useGameStore.getState().buyProperty(currentSpace.id);
  };

  const handleDeclineProperty = () => {
    if (!currentSpace) return;
    useGameStore.getState().declineProperty(currentSpace.id);
  };

  const handlePayTax = () => {
    if (!currentSpace || currentSpace.type !== "tax" || !currentPlayer) return;
    const amount = currentSpace.name.includes("Income") ? 200 : 100;
    useGameStore.getState().payTax(currentPlayerIndex, amount);
  };

  const handleDrawCard = (cardType: "chance" | "community_chest") => {
    useGameStore.getState().drawCard(currentPlayerIndex, cardType);
  };

  const handleJailAction = (action: "card" | "pay" | "roll") => {
    if (currentPlayer) {
      useGameStore.getState().getOutOfJail(currentPlayerIndex, action);
    }
  };

  if (!connected) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh", 
        background: "transparent", 
        color: "var(--gold-primary)",
        fontSize: "24px",
        fontFamily: "var(--font-heading)",
        textTransform: "uppercase",
        letterSpacing: "4px"
      }}>
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
          Entering the Casino...
        </motion.div>
      </div>
    );
  }

  if (!inRoom) {
    return <ServerBrowser />;
  }

  // Winner screen
  if (winner !== undefined) {
    const winnerPlayer = players.find(p => p.id === winner);
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "transparent",
          fontSize: "32px",
          color: "var(--gold-primary)",
        }}
      >
        <motion.div
          className="deco-modal deco-border"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          style={{ padding: "40px", textAlign: "center" }}
        >
          <h1 className="deco-title" style={{ fontSize: "48px", marginBottom: "20px" }}>The Grand Winner</h1>
          <p style={{ fontFamily: "var(--font-body)", letterSpacing: "2px" }}>{winnerPlayer?.name ?? winner} HAS TAKEN ALL</p>
          <button
            className="button action-button"
            onClick={() => location.reload()}
            style={{
              marginTop: "40px",
              padding: "16px 48px",
              fontSize: "18px"
            }}
          >
            Play Again
          </button>
        </motion.div>
      </div>
    );
  }

  // Setup screen
  if (phase === "setup") {
    return <PlayerSetup />;
  }

  // Lobby screen
  if (phase === "lobby") {
    return <MultiplayerLobby />;
  }

  // Split players: AI players on left, human players on right
  const leftPlayers = players.filter((p) => p.isAI);
  const rightPlayers = players.filter((p) => !p.isAI);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "360px 1fr 360px",
        gridTemplateRows: "60px 1fr",
        gridTemplateAreas: `
          "header header header"
          "left center right"
        `,
        height: "100vh",
        width: "100vw",
        background: "var(--charcoal)",
        overflow: "hidden",
        boxSizing: "border-box"
      }}
    >
      {/* Top Header Bar */}
      <div 
        style={{
          gridArea: "header",
          background: "var(--obsidian)",
          borderBottom: "2px solid var(--gold-dark)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          zIndex: 1000
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <motion.button
            className="button"
            whileHover={{ scale: 1.05, backgroundColor: "var(--ruby)", borderColor: "var(--ruby)", color: "var(--ivory)" }}
            whileTap={{ scale: 0.95 }}
            onClick={leaveRoom}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
            }}
            title="Exit Game"
          >
            Leave Table
          </motion.button>
        </div>
        
        <div style={{
          fontSize: "24px",
          fontFamily: "var(--font-heading)",
          fontWeight: "700",
          color: "transparent",
          background: "var(--gold-metallic)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          letterSpacing: "4px",
        }}>
          THE GRAND MONOPOLY
        </div>

        <div style={{ width: "100px", textAlign: "right", color: "var(--gold-dark)", fontFamily: "var(--font-body)", fontSize: "12px", letterSpacing: "1px" }}>
          ROOM {useGameStore.getState().rooms.find(r => r.players === players.length)?.id || ""}
        </div>
      </div>

      {/* Left Side Panel - AI Players Only */}
      <div
        style={{
          gridArea: "left",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "16px",
          height: "calc(100vh - 60px)",
          background: "var(--obsidian)",
          borderRight: "1px solid var(--gold-dark)",
          boxShadow: "inset -10px 0 20px rgba(0,0,0,0.3)",
          minWidth: "360px",
          maxWidth: "360px",
          overflow: "hidden"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: "0 0 auto" }}>
          {leftPlayers.map((player) => (
            <PlayerPropertiesPanel key={player.id} playerIndex={player.id} />
          ))}
        </div>

        {/* Dynamic Action Area - Moved off the board */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "16px", flexShrink: 0 }}>
          {/* Passed GO notification */}
          <AnimatePresence>
            {passedGo && (
              <motion.div
                className="deco-modal deco-border"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                style={{
                  padding: "16px 24px",
                  color: "var(--gold-primary)",
                  fontFamily: "var(--font-heading)",
                  letterSpacing: "2px",
                  fontSize: "20px",
                  textAlign: "center",
                  background: "var(--emerald)",
                  borderColor: "var(--gold-primary)",
                  boxShadow: "0 0 20px rgba(11,69,40,0.8)"
                }}
              >
                PASSED GO! <br /> <span style={{ color: "var(--ivory)", fontSize: "16px", fontFamily: "var(--font-body)", letterSpacing: "1px" }}>+£200</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Last drawn card display */}
          <AnimatePresence>
            {lastCardDrawn && (
              <motion.div
                className="deco-modal deco-border"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={{
                  padding: "20px",
                  textAlign: "center",
                  background: lastCardDrawn.type === "chance" ? "var(--prop-orange)" : "var(--prop-lightblue)",
                  borderColor: "var(--gold-light)",
                  color: "var(--ivory)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.6)"
                }}
              >
                <h4 className="deco-title" style={{ margin: "0 0 12px 0", fontSize: "18px", color: "var(--ivory)", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                  {lastCardDrawn.type === "chance" ? "Chance" : "Community Chest"}
                </h4>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.4", fontStyle: "italic", fontFamily: "var(--font-heading)" }}>{lastCardDrawn.text}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Center - Board */}
      <div
        style={{
          gridArea: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          position: "relative",
          background: "radial-gradient(circle at center, var(--charcoal) 0%, var(--obsidian) 100%)",
          overflow: "hidden", // Important for dragging
          cursor: "grab",
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.cursor = 'grabbing';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.cursor = 'grab';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.cursor = 'grab';
        }}
      >
        {/* Decorative center background elements */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.05, backgroundImage: "linear-gradient(var(--gold-primary) 1px, transparent 1px), linear-gradient(90deg, var(--gold-primary) 1px, transparent 1px)", backgroundSize: "40px 40px", zIndex: 0, pointerEvents: "none" }} />
        
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 100, display: "flex", gap: "8px" }}>
           <div style={{ color: "var(--gold-dark)", fontSize: "12px", fontFamily: "var(--font-heading)", letterSpacing: "1px", fontStyle: "italic", background: "rgba(0,0,0,0.5)", padding: "4px 8px", borderRadius: "2px", border: "1px solid var(--gold-dark)" }}>
              Drag to pan • Scroll to zoom
           </div>
        </div>

        {/* Game Board Container - interactive Pan/Zoom wrapper */}
        <motion.div 
          drag
          dragConstraints={{ left: -800, right: 800, top: -800, bottom: 800 }}
          dragElastic={0.1}
          dragMomentum={false}
          style={{ 
            position: "relative", 
            zIndex: 10,
            touchAction: "none" // Prevent default touch actions like browser scrolling
          }}
        >
          <BoardZoomWrapper>
            <div style={{ position: "relative" }}>
              <Board onSpaceClick={(id) => setInspectedSpaceId(id)} />
              <PlayerTokens />
              
              {/* Auction Modal */}
              <AnimatePresence>
                {phase === "auction" && auction && (
                  <AuctionModal 
                    auction={auction}
                    property={spaces.find(s => s.id === auction.propertyId) as Property}
                    players={players}
                  />
                )}
              </AnimatePresence>

              {/* Trade Modal */}
              <AnimatePresence>
                {phase === "trading" && trade && (
                  <TradeModal
                    trade={trade}
                    players={players}
                    spaces={spaces}
                  />
                )}
              </AnimatePresence>
            </div>
          </BoardZoomWrapper>
        </motion.div>
      </div>

      {/* Right Side Panel - Human Players */}
      <div
        style={{
          gridArea: "right",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "12px",
          height: "calc(100vh - 60px)",
          background: "var(--obsidian)",
          borderLeft: "1px solid var(--gold-dark)",
          boxShadow: "inset 10px 0 20px rgba(0,0,0,0.3)",
          minWidth: "360px",
          maxWidth: "360px",
          overflow: "hidden"
        }}
      >
        {/* Turn Stats - Compact Top Bar */}
        <TurnStats />

        {/* Main Turn Panel - Flexible Height */}
        {currentPlayer && phase !== "auction" && phase !== "trading" && (
            <motion.div
              className="deco-modal"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                padding: "10px",
                textAlign: "center",
                flexShrink: 0,
                maxHeight: "380px",
                overflow: "auto",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div className="deco-border" style={{ padding: "10px 8px", flex: "1 1 auto", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: `radial-gradient(circle at 30% 30%, var(--gold-light), ${currentPlayer.color}, var(--obsidian))`,
                      border: "2px solid var(--gold-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.4)"
                    }}
                  >
                    {currentPlayer.token}
                  </div>
                  <h2 className="deco-title" style={{ margin: 0, fontSize: "18px", lineHeight: "1.2" }}>
                    {currentPlayer.name}'s Turn
                    {currentPlayer.isAI && <span style={{ fontSize: "10px", color: "var(--gold-dark)", marginLeft: "4px", fontFamily: "var(--font-body)", letterSpacing: "1px", display: "block" }}>(AI)</span>}
                  </h2>
                </div>
                
                <p style={{ fontSize: "14px", marginBottom: "8px", color: "var(--ivory)", fontFamily: "var(--font-heading)", letterSpacing: "2px" }}>
                  <span style={{ color: "var(--gold-primary)", fontSize: "11px" }}>FUNDS:</span> £{currentPlayer.cash}
                </p>
                
                <div style={{ borderTop: "1px solid var(--gold-dark)", paddingTop: "10px", marginTop: "8px" }}>
                  {/* AI Thinking Indicator */}
                  {currentPlayer.isAI && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        padding: "8px",
                        fontSize: "12px",
                        color: "var(--gold-primary)",
                        fontWeight: "500",
                        letterSpacing: "2px",
                      }}
                    >
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        DELIBERATING...
                      </motion.span>
                    </motion.div>
                  )}

                  {/* Rolling phase - not in jail */}
                  {phase === "rolling" && !currentPlayer.inJail && !currentPlayer.isAI && isMyTurn && (
                    <div style={{ minHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {!isRolling && (
                        <motion.button
                          className="button action-button"
                          onClick={handleRollDice}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ padding: "12px 24px", fontSize: "13px", width: "100%" }}
                        >
                          {diceRoll ? "Roll Again" : "Roll Dice"}
                        </motion.button>
                      )}
                      {isRolling && (
                        <Dice onRollComplete={handleRollComplete} />
                      )}
                    </div>
                  )}

                  {/* Jail decision phase */}
                  {(phase === "jail_decision" || (phase === "rolling" && currentPlayer.inJail)) && currentPlayer.inJail && (
                    <div style={{ backgroundColor: "var(--charcoal)", padding: "10px", border: "1px solid var(--ruby)", position: "relative" }}>
                      <h3 className="deco-title" style={{ marginBottom: "6px", color: "var(--ruby)", fontSize: "16px" }}>IN JAIL</h3>
                      <p style={{ fontSize: "11px", marginBottom: "10px", color: "var(--ivory-dark)", letterSpacing: "1px" }}>
                        Sentence: Turn {currentPlayer.jailTurns + 1} of 3
                      </p>
                      
                      {/* Hide interactive buttons for AI */}
                      {!currentPlayer.isAI && isMyTurn && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", justifyContent: "center" }}>
                          {currentPlayer.jailFreeCards > 0 && (
                            <motion.button
                              className="button"
                              onClick={() => handleJailAction("card")}
                              whileHover={{ scale: 1.02, borderColor: "var(--gold-primary)", color: "var(--gold-primary)" }}
                              whileTap={{ scale: 0.98 }}
                              style={{ padding: "8px", fontSize: "11px", width: "100%" }}
                            >
                              Use Pardon ({currentPlayer.jailFreeCards})
                            </motion.button>
                          )}
                          {currentPlayer.cash >= 50 && (
                            <motion.button
                              className="button"
                              onClick={() => handleJailAction("pay")}
                              whileHover={{ scale: 1.02, borderColor: "var(--gold-primary)", color: "var(--gold-primary)" }}
                              whileTap={{ scale: 0.98 }}
                              style={{ padding: "8px", fontSize: "11px", width: "100%" }}
                            >
                              Pay Fine £50
                            </motion.button>
                          )}
                          <motion.button
                            className="button action-button"
                            onClick={() => handleJailAction("roll")}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ padding: "8px", fontSize: "11px", width: "100%" }}
                          >
                            Attempt Doubles
                          </motion.button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Buy decision phase */}
                  {phase === "awaiting_buy_decision" && currentSpace && isProperty(currentSpace) && (
                    <div style={{ backgroundColor: "var(--obsidian)", border: "1px solid var(--gold-dark)", padding: "10px", position: "relative" }}>
                      <h3 className="deco-title" style={{ marginBottom: "6px", fontSize: "14px" }}>{currentSpace.name}</h3>
                      <p style={{ fontSize: "13px", marginBottom: "10px", color: "var(--gold-light)", fontFamily: "var(--font-heading)" }}>
                        Valuation: £{currentSpace.price}
                      </p>
                      
                      {/* Hide interactive buttons for AI */}
                      {!currentPlayer.isAI && isMyTurn && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center" }}>
                          {currentPlayer.cash >= currentSpace.price ? (
                            <>
                              <motion.button
                                className="button action-button"
                                onClick={handleBuyProperty}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{ padding: "12px", fontSize: "12px", width: "100%" }}
                              >
                                Invest (£{currentSpace.price})
                              </motion.button>
                              <motion.button
                                className="button"
                                onClick={handleDeclineProperty}
                                whileHover={{ scale: 1.02, borderColor: "var(--gold-primary)" }}
                                whileTap={{ scale: 0.98 }}
                                style={{ padding: "12px", fontSize: "12px", width: "100%" }}
                              >
                                Send to Auction
                              </motion.button>
                            </>
                          ) : (
                            <div style={{ textAlign: "center" }}>
                              <p style={{ color: "var(--ruby)", fontWeight: "500", marginBottom: "12px", letterSpacing: "1px", fontSize: "12px" }}>
                                INSUFFICIENT FUNDS
                              </p>
                              <motion.button
                                className="button"
                                onClick={handleDeclineProperty}
                                whileHover={{ scale: 1.02, borderColor: "var(--gold-primary)" }}
                                whileTap={{ scale: 0.98 }}
                                style={{ width: "100%" }}
                              >
                                Auction Property
                              </motion.button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resolving space phase */}
                  {phase === "resolving_space" && currentSpace && (
                    <div>
                      <div style={{ marginBottom: "16px" }}>
                        <DiceDisplay />
                      </div>
                      
                      <div style={{ backgroundColor: "var(--obsidian)", border: "1px solid var(--gold-dark)", padding: "16px" }}>
                        <h3 className="deco-title" style={{ marginBottom: "12px", fontSize: "18px" }}>{currentSpace.name}</h3>
                        
                        {/* Property display */}
                        {isProperty(currentSpace) && (
                          <div style={{ marginBottom: "16px" }}>
                            {currentSpace.owner !== undefined && currentSpace.owner !== currentPlayerIndex && (
                              <p style={{ color: "var(--ruby)", letterSpacing: "1px", fontSize: "12px", lineHeight: "1.4" }}>
                                Owned by {players[currentSpace.owner]?.name ?? "Unknown"}
                                {currentSpace.mortgaged && " (Mortgaged)"}
                              </p>
                            )}
                            {currentSpace.owner === currentPlayerIndex && (
                              <p style={{ color: "var(--gold-primary)", letterSpacing: "1px", fontSize: "12px", lineHeight: "1.4" }}>You hold the deed.</p>
                            )}
                          </div>
                        )}

                        {/* Tax payment */}
                        {currentSpace.type === "tax" && (
                          <div style={{ marginBottom: "12px" }}>
                            <p style={{ fontSize: "12px", marginBottom: "12px", color: "var(--ruby)", letterSpacing: "1px", lineHeight: "1.4" }}>
                              Paid £{currentSpace.name.includes("Income") ? 200 : 100} tax
                            </p>
                            {!currentPlayer.isAI && isMyTurn && (
                              <motion.button
                                className="button"
                                onClick={handleEndTurn}
                                whileHover={{ scale: 1.02, borderColor: "var(--gold-primary)", color: "var(--gold-primary)" }}
                                whileTap={{ scale: 0.98 }}
                                style={{ width: "100%", padding: "10px", fontSize: "12px" }}
                              >
                                Conclude Turn
                              </motion.button>
                            )}
                          </div>
                        )}

                        {/* Card spaces */}
                        {(currentSpace.type === "chance" || currentSpace.type === "community_chest") && !lastCardDrawn && (
                          <div style={{ marginBottom: "12px", marginTop: "12px" }}>
                            {!currentPlayer.isAI && isMyTurn && (
                              <motion.button
                                className="button action-button"
                                onClick={() => handleDrawCard(currentSpace.type as "chance" | "community_chest")}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{ width: "100%", padding: "12px", fontSize: "12px" }}
                              >
                                Draw {currentSpace.type === "chance" ? "Chance" : "Chest"}
                              </motion.button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* End turn button */}
                      {diceRoll && !currentPlayer.inJail && !currentPlayer.isAI && isMyTurn && currentSpace.type !== "tax" && (
                        <motion.button
                          className={diceRoll.isDoubles ? "button action-button" : "button"}
                          onClick={handleEndTurn}
                          whileHover={{ scale: 1.02, ...(diceRoll.isDoubles ? {} : { borderColor: "var(--gold-primary)", color: "var(--gold-primary)" }) }}
                          whileTap={{ scale: 0.98 }}
                          style={{ marginTop: "16px", width: "100%", padding: "12px", fontSize: "12px" }}
                        >
                          {diceRoll.isDoubles ? "Roll Again" : "Conclude Turn"}
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
        )}

        {/* Other Human Players - Scrollable Section */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "6px",
          flex: "1 1 auto",
          minHeight: 0
        }}>
          {/* Toggle Button */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "4px",
            borderBottom: "1px solid var(--gold-dark)"
          }}>
            <span style={{
              fontSize: "10px",
              fontFamily: "var(--font-heading)",
              letterSpacing: "1.5px",
              color: "var(--gold-dark)",
              textTransform: "uppercase"
            }}>
              Opponents ({rightPlayers.filter((p) => p.id !== myPlayerIndex).length})
            </span>
            <motion.button
              onClick={() => setIsOpponentsCompact(!isOpponentsCompact)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: "transparent",
                border: "1px solid var(--gold-dark)",
                borderRadius: "2px",
                padding: "2px 8px",
                fontSize: "8px",
                fontFamily: "var(--font-heading)",
                letterSpacing: "1px",
                color: "var(--gold-dark)",
                cursor: "pointer",
                textTransform: "uppercase"
              }}
            >
              {isOpponentsCompact ? "EXPAND" : "COLLAPSE"}
            </motion.button>
          </div>
          
          {/* Scrollable Players List */}
          <div style={{
            flex: "1 1 auto",
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}
          className="hide-scrollbar"
          >
            {rightPlayers
              .filter((p) => p.id !== myPlayerIndex)
              .map((player) => (
                isOpponentsCompact ? (
                  <PlayerSummaryCard 
                    key={player.id} 
                    playerIndex={player.id} 
                    isCompact={true}
                    onExpand={() => setIsOpponentsCompact(false)}
                  />
                ) : (
                  <PlayerPropertiesPanel key={player.id} playerIndex={player.id} />
                )
              ))}
          </div>
        </div>

        {/* Your Player Card - Compact Bottom */}
        {myPlayerIndex !== null && players[myPlayerIndex] && (
          <div style={{
            flexShrink: 0,
            border: "2px solid var(--gold-primary)",
            borderRadius: "4px",
            boxShadow: "0 0 15px rgba(212,175,55,0.2)",
            background: "var(--charcoal)"
          }}>
            <PlayerPropertiesPanel key={myPlayerIndex} playerIndex={myPlayerIndex} />
          </div>
        )}
      </div>
      
      {/* Floating Ledger - always at bottom center */}
      <GameLog />
      
      <PlayerSelectionModal />

      {/* Property Inspection Modal */}
      <AnimatePresence>
        {inspectedSpaceId !== null && (
          <PropertyCard 
            space={spaces.find(s => s.id === inspectedSpaceId) as Space} 
            onClose={() => setInspectedSpaceId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
