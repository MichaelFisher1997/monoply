import { create } from "zustand";
import type { GameState, Property, ColorGroup, GameLogEntry, TradeOffer } from "../types/game";
import { boardSpaces } from "../data/board";
import { getPlayerProperties, hasMonopoly } from "../logic/rules/monopoly";

const isProperty = (space: any): space is Property => {
  return space.type === "property" || space.type === "railroad" || space.type === "utility";
};

type GameStore = GameState & {
  connected: boolean;
  inRoom: boolean;
  connect: () => void;

  // Actions (send to server)
  initGame: (playerNames: string[], tokens: string[], isAIFlags?: boolean[]) => void;
  rollDice: () => void;
  movePlayer: (playerIndex: number, steps: number) => void;
  buyProperty: (propertyId: number) => void;
  declineProperty: (propertyId: number) => void;
  payRent: (playerIndex: number, propertyId: number, diceTotal: number) => void;
  payTax: (playerIndex: number, amount: number) => void;
  endTurn: () => void;
  goToJail: (playerIndex: number) => void;
  getOutOfJail: (playerIndex: number, method: "roll" | "pay" | "card") => void;
  buildHouse: (propertyId: number) => void;
  buildHotel: (propertyId: number) => void;
  sellHouse: (propertyId: number) => void;
  sellHotel: (propertyId: number) => void;
  mortgageProperty: (propertyId: number) => void;
  unmortgageProperty: (propertyId: number) => void;
  drawCard: (playerIndex: number, type: "chance" | "community_chest") => void;
  checkBankruptcy: (playerIndex: number) => void;
  declareBankruptcy: (playerIndex: number, creditorIndex?: number) => void;
  checkWinCondition: () => void;
  startAuction: (propertyId: number) => void;
  placeBid: (playerIndex: number, amount: number) => void;
  passAuction: (playerIndex: number) => void;
  endAuction: () => void;
  startTrade: (fromPlayer: number, toPlayer: number) => void;
  updateTradeOffer: (offer: TradeOffer) => void;
  proposeTrade: (offer: TradeOffer) => void;
  acceptTrade: () => void;
  rejectTrade: () => void;
  cancelTrade: () => void;
  executeAITurn: () => void;
  executeAITradeResponse: () => void;
  
  // Room actions
  createRoom: (mode?: "single" | "multi") => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  listRooms: () => void;
  
  // Lobby actions
  addPlayer: (name: string, token: string, clientId: string) => void;
  updatePlayer: (index: number, name: string, token: string) => void;
  startGame: () => void;

  rooms: { id: string; players: number }[];
  
  // Helpers (local read-only)
  getPlayerProperties: (playerIndex: number) => Property[];
  getPropertyById: (propertyId: number) => Property | undefined;
  hasMonopoly: (playerIndex: number, colorGroup: ColorGroup) => boolean;
};

let socket: WebSocket | null = null;

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  players: [],
  currentPlayerIndex: 0,
  spaces: boardSpaces,
  chanceDeck: [],
  communityChestDeck: [],
  diceRoll: undefined,
  consecutiveDoubles: 0,
  phase: "setup",
  passedGo: false,
  auction: undefined,
  trade: undefined,
  lastCardDrawn: undefined,
  gameLog: [],
  turn: 1,
  connected: false,
  inRoom: false,
  rooms: [],

  connect: () => {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    socket = new WebSocket(`${protocol}//${host}/ws`);

    socket.onopen = () => {
      console.log("Connected to game server");
      set({ connected: true });
      // Ask for room list immediately
      socket?.send(JSON.stringify({ type: "LIST_ROOMS" }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "STATE_UPDATE") {
          console.log("Received state update", data.state);
          set({ ...data.state, inRoom: true });
        } else if (data.type === "ROOM_LIST") {
          set({ rooms: data.rooms });
        } else if (data.type === "ROOM_CREATED") {
          // Auto-join the created room
          console.log("Room created, joining:", data.roomId);
          get().joinRoom(data.roomId);
        }
      } catch (e) {
        console.error("Failed to parse server message", e);
      }
    };

    socket.onclose = () => {
      console.log("Disconnected from game server");
      set({ connected: false });
      // Retry connection?
      setTimeout(() => get().connect(), 3000);
    };
  },

  createRoom: (mode = "single") => {
    socket?.send(JSON.stringify({ type: "CREATE_ROOM", mode }));
  },
  joinRoom: (roomId: string) => {
    socket?.send(JSON.stringify({ type: "JOIN_ROOM", roomId }));
  },
  leaveRoom: () => {
    set({ inRoom: false });
  },
  listRooms: () => {
    socket?.send(JSON.stringify({ type: "LIST_ROOMS" }));
  },
  addPlayer: (name, token, clientId) => {
    socket?.send(JSON.stringify({ type: "ACTION", action: "addPlayer", payload: [name, token, clientId] }));
  },
  updatePlayer: (index, name, token) => {
    socket?.send(JSON.stringify({ type: "ACTION", action: "updatePlayer", payload: [index, name, token] }));
  },
  startGame: () => {
    socket?.send(JSON.stringify({ type: "ACTION", action: "startGame", payload: [] }));
  },

  // Generic action sender
  ...([
    "initGame", "rollDice", "movePlayer", "buyProperty", "declineProperty", 
    "payRent", "payTax", "endTurn", "goToJail", "getOutOfJail", 
    "buildHouse", "buildHotel", "sellHouse", "sellHotel", 
    "mortgageProperty", "unmortgageProperty", "drawCard", 
    "checkBankruptcy", "declareBankruptcy", "checkWinCondition", 
    "startAuction", "placeBid", "passAuction", "endAuction", 
    "startTrade", "updateTradeOffer", "proposeTrade", "acceptTrade", 
    "rejectTrade", "cancelTrade", "executeAITurn", "executeAITradeResponse"
  ].reduce((acc, action) => {
    acc[action] = (...args: any[]) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        try {
          // Debug logging for trade actions
          if (action === 'proposeTrade' || action === 'updateTradeOffer') {
            console.log(`Sending ${action}:`, JSON.stringify(args, null, 2));
          }
          
          // Sanitize args - only allow primitives and simple objects
          const sanitizedArgs = args.map(arg => {
            if (arg === null || arg === undefined) return arg;
            if (typeof arg === 'number' || typeof arg === 'string' || typeof arg === 'boolean') return arg;
            // For arrays, extract primitives only
            if (Array.isArray(arg)) {
              return arg.map(item => {
                if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
                  return item;
                }
                if (item === null || item === undefined) {
                  return item;
                }
                // For objects in arrays, extract key-value pairs
                return Object.keys(item).reduce((acc, key) => {
                  const val = item[key];
                  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || val === null) {
                    acc[key] = val;
                  }
                  return acc;
                }, {} as any);
              });
            }
            if (typeof arg === 'object') {
              // Extract properties from objects, including nested arrays of primitives
              return Object.keys(arg).reduce((acc, key) => {
                const val = arg[key];
                if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || val === null) {
                  acc[key] = val;
                } else if (Array.isArray(val) && val.every(item => typeof item === 'number' || typeof item === 'string')) {
                  // Allow arrays of primitives (like property IDs)
                  acc[key] = val;
                }
                return acc;
              }, {} as any);
            }
            return arg;
          });
          socket.send(JSON.stringify({ type: "ACTION", action, payload: sanitizedArgs }));
          
          // Debug logging for trade actions
          if (action === 'proposeTrade' || action === 'updateTradeOffer') {
            console.log(`Sent ${action} with sanitized data:`, JSON.stringify(sanitizedArgs, null, 2));
          }
        } catch (e) {
          console.error(`Failed to send action ${action}:`, e, args);
        }
      } else {
        console.warn("Socket not connected, action ignored:", action);
      }
    };
    return acc;
  }, {} as any)),

  // Helpers
  getPlayerProperties: (playerIndex: number): Property[] => {
    const state = get();
    return getPlayerProperties(state, playerIndex);
  },

  getPropertyById: (propertyId: number): Property | undefined => {
    const state = get();
    const space = state.spaces.find(s => s.id === propertyId);
    return space && isProperty(space) ? space : undefined;
  },

  hasMonopoly: (playerIndex: number, colorGroup: ColorGroup): boolean => {
    const state = get();
    return hasMonopoly(state, playerIndex, colorGroup);
  },
}));
