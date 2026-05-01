import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { addMessage, setTyping, clearTyping, setConnected } from "../store/chatSlice";
import { addTicketRealtime, updateTicketRealtime } from "../store/ticketSlice";
import { addNotification } from "../store/uiSlice";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useSocket() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => dispatch(setConnected(true)));
    socket.on("disconnect", () => dispatch(setConnected(false)));

    // Chat events
    socket.on("chat:message", ({ message }) => dispatch(addMessage(message)));
    socket.on("chat:typing", ({ ticketId, user }) => {
      dispatch(setTyping({ ticketId, user }));
      setTimeout(() => dispatch(clearTyping({ ticketId, user })), 2000);
    });

    // Ticket events
    socket.on("ticket:new", ({ ticket }) => {
      dispatch(addTicketRealtime(ticket));
      dispatch(addNotification({ type: "info", text: `New ticket: ${ticket.subject}` }));
    });
    socket.on("ticket:updated", ({ ticket }) => dispatch(updateTicketRealtime(ticket)));
    socket.on("ticket:assigned", ({ ticket }) => {
      dispatch(addNotification({ type: "success", text: `Ticket assigned: ${ticket.subject}` }));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, dispatch]);

  return socketRef;
}
