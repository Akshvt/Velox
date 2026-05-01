import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ticketService } from "../services";

export const fetchTickets = createAsyncThunk("tickets/fetch", async (params) => {
  const { data } = await ticketService.list(params);
  return data;
});

export const updateTicket = createAsyncThunk("tickets/update", async ({ id, updates }) => {
  const { data } = await ticketService.update(id, updates);
  return data.ticket;
});

const ticketSlice = createSlice({
  name: "tickets",
  initialState: {
    tickets: [],
    selectedTicket: null,
    filters: { status: "", assignedTo: "", priority: "" },
    pagination: { page: 1, limit: 20, total: 0 },
    status: "idle",
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    selectTicket: (state, action) => { state.selectedTicket = action.payload; },
    addTicketRealtime: (state, action) => { state.tickets.unshift(action.payload); state.pagination.total++; },
    updateTicketRealtime: (state, action) => {
      const idx = state.tickets.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) state.tickets[idx] = action.payload;
      if (state.selectedTicket?._id === action.payload._id) state.selectedTicket = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending,   (s) => { s.status = "loading"; })
      .addCase(fetchTickets.fulfilled, (s, a) => { s.status = "ok"; s.tickets = a.payload.tickets; s.pagination = a.payload.pagination; })
      .addCase(fetchTickets.rejected,  (s) => { s.status = "failed"; })
      .addCase(updateTicket.fulfilled, (s, a) => {
        const idx = s.tickets.findIndex((t) => t._id === a.payload._id);
        if (idx !== -1) s.tickets[idx] = a.payload;
      });
  },
});

export const { setFilters, selectTicket, addTicketRealtime, updateTicketRealtime } = ticketSlice.actions;
export default ticketSlice.reducer;
