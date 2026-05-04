/**
 * Tiny socket.io-compatible mock for local dev when no backend is running.
 * Supports: on/off/emit/connect/disconnect + an internal `__simulate(event, payload)`
 * helper to push synthetic events from anywhere (e.g. demos).
 */
export function mockSocket() {
  const listeners = new Map();
  let connected = false;

  const api = {
    connected: false,

    on(event, fn) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(fn);
      return api;
    },
    off(event, fn) {
      if (!listeners.has(event)) return api;
      if (fn) listeners.get(event).delete(fn);
      else listeners.delete(event);
      return api;
    },
    emit(event, payload) {
      // In real socket.io this sends to server. Here, we echo selected events
      // back as if the server handled them, to make UIs feel alive.
      if (event === "chat:message") {
        // Simulate AI reply after short delay
        setTimeout(() => {
          api.__dispatch("chat:typing", { from: "ai", typing: true });
          setTimeout(() => {
            api.__dispatch("chat:typing", { from: "ai", typing: false });
            api.__dispatch("chat:ai-reply", {
              conversationId: payload?.conversationId,
              text: "Thanks for your message - looking into that for you.",
              time: now(),
            });
          }, 900);
        }, 350);
      }
      return api;
    },
    connect() {
      connected = true;
      api.connected = true;
      api.__dispatch("connect");
      return api;
    },
    disconnect() {
      connected = false;
      api.connected = false;
      api.__dispatch("disconnect");
      return api;
    },

    /* Internal helpers (not part of socket.io API) */
    __dispatch(event, payload) {
      const set = listeners.get(event);
      if (set) set.forEach((fn) => fn(payload));
    },
    __simulate(event, payload) {
      api.__dispatch(event, payload);
    },
  };

  // auto-connect to mimic default socket.io
  queueMicrotask(() => api.connect());
  return api;
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
