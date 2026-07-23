import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DiceRoll } from "../types/game";

export interface TurnStats {
  turnNumber: number;
  playerIndex: number;
  startCash: number;
  endCash: number;
  moneyIn: number;
  moneyOut: number;
  diceRoll?: DiceRoll;
  spaceLanded?: string;
  isActive: boolean;
}

interface LocalState {
  myPlayerIndex: number | null;
  clientId: string;
  turnStats: TurnStats | null;
  setMyPlayerIndex: (index: number | null) => void;
  startTurnStats: (turnNumber: number, playerIndex: number, startCash: number) => void;
  recordDiceRoll: (diceRoll: DiceRoll) => void;
  recordSpaceLanded: (spaceName: string) => void;
  recordMoneyChange: (amount: number) => void;
  endTurnStats: () => void;
  clearTurnStats: () => void;
}

export const useLocalStore = create<LocalState>()(
  persist(
    (set) => ({
      myPlayerIndex: null,
      clientId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      turnStats: null as TurnStats | null,
      
      setMyPlayerIndex: (index) => set({ myPlayerIndex: index }),
      
      startTurnStats: (turnNumber, playerIndex, startCash) => set({
        turnStats: {
          turnNumber,
          playerIndex,
          startCash,
          endCash: startCash,
          moneyIn: 0,
          moneyOut: 0,
          isActive: true
        }
      }),
      
      recordDiceRoll: (diceRoll) => set((state) => ({
        turnStats: state.turnStats ? { 
          ...state.turnStats, 
          diceRoll: { ...diceRoll } // Clone to avoid circular refs
        } : null
      })),
      
      recordSpaceLanded: (spaceName) => set((state) => ({
        turnStats: state.turnStats ? { ...state.turnStats, spaceLanded: spaceName } : null
      })),
      
      recordMoneyChange: (amount) => set((state) => {
        if (!state.turnStats) return state;
        
        const newEndCash = state.turnStats.endCash + amount;
        
        if (amount > 0) {
          return {
            turnStats: {
              ...state.turnStats,
              endCash: newEndCash,
              moneyIn: state.turnStats.moneyIn + amount
            }
          };
        } else if (amount < 0) {
          return {
            turnStats: {
              ...state.turnStats,
              endCash: newEndCash,
              moneyOut: state.turnStats.moneyOut + Math.abs(amount)
            }
          };
        }
        
        return state;
      }),
      
      endTurnStats: () => set((state) => ({
        turnStats: state.turnStats ? { 
          ...state.turnStats, 
          isActive: false 
        } : null
      })),
      
      clearTurnStats: () => set({ turnStats: null })
    }),
    {
      name: "monopoly-client-storage",
      partialize: (state) => ({
        myPlayerIndex: state.myPlayerIndex,
        clientId: state.clientId,
        // turnStats is excluded - it's transient data
      }),
    }
  )
);
