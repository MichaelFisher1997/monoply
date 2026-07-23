import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";

export const ServerBrowser = () => {
  const { rooms, listRooms, createRoom, joinRoom } = useGameStore();

  useEffect(() => {
    // Poll for rooms
    const interval = setInterval(listRooms, 2000);
    listRooms();
    return () => clearInterval(interval);
  }, []);

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
        <h1 className="deco-title" style={{ fontSize: "42px", marginBottom: "8px", fontWeight: 700 }}>
          THE GRAND <br/>
          <span style={{ fontSize: "20px", color: "var(--ivory)", fontFamily: "var(--font-body)", letterSpacing: "8px" }}>MONOPOLY</span>
        </h1>
        <p style={{ color: "var(--gold-dark)", marginBottom: "32px", fontSize: "16px", fontStyle: "italic", fontFamily: "var(--font-heading)", letterSpacing: "1px" }}>
          Select your table
        </p>

        <motion.button
          className="button action-button"
          whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(212,175,55,0.4)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => createRoom("single")}
          style={{
            padding: "20px 40px",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            width: "100%",
            marginBottom: "32px",
          }}
        >
          <span style={{ fontSize: "24px" }}>👤</span>
          Private Table
        </motion.button>

        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "16px", 
          padding: "24px", 
          backgroundColor: "var(--obsidian)", 
          border: "1px solid var(--gold-dark)",
          borderRadius: "2px",
          width: "100%",
          boxSizing: "border-box",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="deco-title" style={{ fontSize: "20px", margin: 0 }}>High Roller Rooms</h2>
            <motion.button
              className="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => createRoom("multi")}
              style={{
                padding: "8px 16px",
                fontSize: "12px",
              }}
            >
              + Host Room
            </motion.button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto", paddingRight: "4px" }}>
            {rooms.length === 0 ? (
              <div style={{ color: "var(--gold-dark)", fontStyle: "italic", padding: "16px", fontFamily: "var(--font-heading)", letterSpacing: "1px" }}>No public rooms available. Host one!</div>
            ) : (
              rooms.map((room) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    backgroundColor: "var(--charcoal)",
                    borderRadius: "2px",
                    border: "1px solid var(--gold-dark)",
                    borderLeft: "2px solid var(--gold-primary)"
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: "500", fontSize: "16px", color: "var(--ivory)", fontFamily: "var(--font-heading)", letterSpacing: "1px" }}>Table {room.id}</div>
                    <div style={{ fontSize: "12px", color: "var(--gold-dark)", fontFamily: "var(--font-body)" }}>{room.players} players</div>
                  </div>
                  <motion.button
                    className="button action-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => joinRoom(room.id)}
                    style={{
                      padding: "8px 20px",
                      fontSize: "12px",
                    }}
                  >
                    Join
                  </motion.button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
