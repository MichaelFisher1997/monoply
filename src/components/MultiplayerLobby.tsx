import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { useLocalStore } from "../store/localStore";

const TOKENS = ["🚗", "🚙", "🚕", "🏎", "🚁", "✈️", "⛵", "🎭"];

export const MultiplayerLobby = () => {
  const { players, addPlayer, startGame, leaveRoom } = useGameStore();
  const { clientId, setMyPlayerIndex } = useLocalStore();
  
  const myPlayer = players.find(p => p.clientId === clientId);
  
  React.useEffect(() => {
    if (myPlayer) {
      setMyPlayerIndex(myPlayer.id);
    }
  }, [myPlayer]);

  const [name, setName] = React.useState("");
  const [token, setToken] = React.useState("");

  const handleJoin = () => {
    if (name && token) {
      addPlayer(name, token, clientId);
    }
  };

  const isHost = players.length > 0 && players[0]!.clientId === clientId;

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
        color: "var(--ivory)",
      }}
    >
      <motion.div
        className="deco-modal deco-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: "40px",
          textAlign: "center",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <button
          className="button"
          onClick={leaveRoom}
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            fontSize: "14px",
            padding: "8px 16px",
          }}
        >
          LEAVE
        </button>

        <h1 className="deco-title" style={{ fontSize: "32px", marginBottom: "24px", marginTop: "20px" }}>
          The Waiting Room
        </h1>

        <div style={{ marginBottom: "32px" }}>
          <h3 className="deco-title" style={{ marginBottom: "16px", fontSize: "18px" }}>Guests ({players.length}/8)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "200px", overflowY: "auto", paddingRight: "4px" }}>
            {players.length === 0 ? (
              <div style={{ fontStyle: "italic", color: "var(--gold-dark)", fontFamily: "var(--font-heading)", letterSpacing: "1px" }}>Awaiting arrivals...</div>
            ) : (
              players.map((p) => (
                <div 
                  key={p.id}
                  style={{ 
                    padding: "16px", 
                    background: "var(--charcoal)", 
                    borderRadius: "2px",
                    border: "1px solid var(--gold-dark)",
                    borderLeft: "2px solid var(--gold-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}
                >
                  <span style={{ fontSize: "24px", filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.5))" }}>{p.token}</span>
                  <span style={{ fontWeight: "500", fontFamily: "var(--font-heading)", letterSpacing: "1px", color: "var(--ivory)", fontSize: "18px" }}>{p.name}</span>
                  {p.clientId === clientId && <span style={{ color: "var(--gold-light)", fontFamily: "var(--font-body)", fontSize: "12px", letterSpacing: "1px" }}>(You)</span>}
                  {p.id === 0 && <span style={{ color: "var(--gold-primary)", fontFamily: "var(--font-body)", fontSize: "12px", letterSpacing: "1px", marginLeft: "auto" }}>👑 HOST</span>}
                </div>
              ))
            )}
          </div>
        </div>

        {!myPlayer ? (
          <div style={{ borderTop: "1px solid var(--gold-dark)", paddingTop: "24px" }}>
            <h3 className="deco-title" style={{ marginBottom: "16px", fontSize: "20px" }}>Join the Table</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <input
                type="text"
                placeholder="Your Alias"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box" }}
              />
              
              <div>
                <label style={{ display: "block", marginBottom: "12px", textAlign: "left", color: "var(--ivory)", fontFamily: "var(--font-body)", letterSpacing: "1px", fontSize: "12px", textTransform: "uppercase" }}>Select Token:</label>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                  {TOKENS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setToken(t)}
                      style={{
                        fontSize: "24px",
                        padding: "12px",
                        borderRadius: "2px",
                        border: token === t ? "2px solid var(--gold-primary)" : "1px solid var(--gold-dark)",
                        backgroundColor: token === t ? "var(--charcoal)" : "var(--obsidian)",
                        cursor: "pointer",
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                className="button action-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleJoin}
                disabled={!name || !token}
                style={{
                  padding: "16px",
                  fontSize: "16px",
                  width: "100%",
                  marginTop: "16px",
                  opacity: (!name || !token) ? 0.5 : 1
                }}
              >
                JOIN TABLE
              </motion.button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: "24px" }}>
            {isHost ? (
              <motion.button
                className="button action-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                disabled={players.length < 2}
                style={{
                  padding: "16px 48px",
                  fontSize: "18px",
                  opacity: players.length < 2 ? 0.5 : 1
                }}
              >
                START GAME
              </motion.button>
            ) : (
              <div style={{ color: "var(--gold-dark)", fontFamily: "var(--font-heading)", fontStyle: "italic", letterSpacing: "1px" }}>Waiting for host to commence...</div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
