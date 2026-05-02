import { useEffect, useRef } from "react";
import { getSocket } from "./socket";

/**
 * Subscribe to one or more socket events for the lifetime of the component.
 *
 *   useSocket("chat:message", (msg) => { ... });
 *
 *   useSocket({
 *     "chat:message": (msg) => ...,
 *     "ticket:created": (t) => ...,
 *   });
 *
 * Returns the socket instance so callers can `.emit(...)`.
 */
export function useSocket(eventOrMap, handler) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const map =
      typeof eventOrMap === "string"
        ? { [eventOrMap]: handler }
        : eventOrMap || {};

    Object.entries(map).forEach(([evt, fn]) => {
      if (typeof fn === "function") socket.on(evt, fn);
    });

    return () => {
      Object.entries(map).forEach(([evt, fn]) => {
        if (typeof fn === "function") socket.off(evt, fn);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socketRef.current || getSocket();
}
