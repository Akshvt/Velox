import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { chatService } from "../services";

export const fetchMessages = createAsyncThunk("chat/fetchMessages", async (ticketId) => {
  const { data } = await chatService.getMessages(ticketId);
  return { ticketId, messages: data.messages };
});

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    activeTicketId: null,
    messages: {},    // { [ticketId]: Message[] }
    typing: {},      // { [ticketId]: userId[] }
    connected: false,
  },
  reducers: {
    setActiveTicket: (state, action) => { state.activeTicketId = action.payload; },
    addMessage: (state, action) => {
      const { ticketId } = action.payload;
      if (!state.messages[ticketId]) state.messages[ticketId] = [];
      state.messages[ticketId].push(action.payload);
    },
    setTyping: (state, action) => {
      const { ticketId, user } = action.payload;
      if (!state.typing[ticketId]) state.typing[ticketId] = [];
      if (!state.typing[ticketId].includes(user)) state.typing[ticketId].push(user);
    },
    clearTyping: (state, action) => {
      const { ticketId, user } = action.payload;
      if (state.typing[ticketId]) {
        state.typing[ticketId] = state.typing[ticketId].filter((u) => u !== user);
      }
    },
    setConnected: (state, action) => { state.connected = action.payload; },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (s, a) => {
      s.messages[a.payload.ticketId] = a.payload.messages;
    });
  },
});

export const { setActiveTicket, addMessage, setTyping, clearTyping, setConnected } = chatSlice.actions;
export default chatSlice.reducer;
