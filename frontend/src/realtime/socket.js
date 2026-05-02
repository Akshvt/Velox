import { io } from "socket.io-client";
import { STORAGE_KEYS } from "@lib/constants";
import { mockSocket } from "./mockSocket";

/**
 * Socket.IO contract — backend/src/socket/*.js
 *
 * Connection:
 *   - URL: backend origin (Socket.IO mounts on the same HTTP server as Express).
 *   - Auth: pass the access token via `auth: { token }` (verified by socketAuth).
 *   - withCredentials: true (refresh cookie is on the same origin).
 *
 * Server -> client events (all payloads use { ticket } / { message } shape):
 *   chat:message     { message }
 *   chat:typing      { ticketId, user }
 *   ticket:new       { ticket }
 *   ticket:updated   { ticket }
 *   ticket:assigned  { ticket, agentId }
 *
 * Client -> server events:
 *   chat:join        { ticketId }
 *   chat:leave       { ticketId }
 *   chat:send        { ticketId, content, senderType? }
 *   chat:typing      { ticketId }
 *   agent:status     { status: "online" | "away" }
 */
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000";

const USE_MOCK =
  import.meta.env.VITE_USE_MOCK !== "false" && import.meta.env.DEV;

let socket = null;

/**
 * Returns a singleton socket-like client.
 * In mock mode, returns an in-memory event emitter that mimics socket.io's API.
 * In real mode, lazily connects to the backend with the access token.
 */
export function getSocket() {
  if (socket) return socket;

  if (USE_MOCK) {
    socket = mockSocket();
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
    auth: (cb) => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      cb(token ? { token } : {});
    },
  });
  socket.connect();
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect?.();
    socket = null;
  }
}

/**
 * Customer-side widget socket — auths via tenant apiKey + sessionToken,
 * NOT the agent's JWT. Use a separate instance so it doesn't clash with the
 * agent dashboard's socket on the same browser.
 */
let widgetSocket = null;
export function getWidgetSocket({ apiKey, sessionToken }) {
  if (widgetSocket) return widgetSocket;
  widgetSocket = io(SOCKET_URL, {
    autoConnect: true,
    withCredentials: false,
    transports: ["websocket", "polling"],
    auth: { apiKey, sessionToken },
  });
  return widgetSocket;
}
export function disconnectWidgetSocket() {
  if (widgetSocket) {
    widgetSocket.disconnect?.();
    widgetSocket = null;
  }
}

/* Event-name catalog — must mirror backend/src/socket/*.js */
export const SOCKET_EVENTS = {
  // Server -> client (chat)
  CHAT_MESSAGE: "chat:message",
  CHAT_TYPING: "chat:typing",
  // Server -> client (tickets)
  TICKET_NEW: "ticket:new",
  TICKET_UPDATED: "ticket:updated",
  TICKET_ASSIGNED: "ticket:assigned",
  // Client -> server
  CHAT_JOIN: "chat:join",
  CHAT_LEAVE: "chat:leave",
  CHAT_SEND: "chat:send",
  AGENT_STATUS: "agent:status",
  // Generic
  ERROR: "error",
};

/* -------- Convenience emit helpers (typo-safe) -------- */
export const socketActions = {
  joinTicket: (ticketId) => getSocket().emit(SOCKET_EVENTS.CHAT_JOIN, { ticketId }),
  leaveTicket: (ticketId) => getSocket().emit(SOCKET_EVENTS.CHAT_LEAVE, { ticketId }),
  sendMessage: ({ ticketId, content, senderType }) =>
    getSocket().emit(SOCKET_EVENTS.CHAT_SEND, { ticketId, content, senderType }),
  typing: (ticketId) => getSocket().emit(SOCKET_EVENTS.CHAT_TYPING, { ticketId }),
  setAgentStatus: (status) =>
    getSocket().emit(SOCKET_EVENTS.AGENT_STATUS, { status }),
};
