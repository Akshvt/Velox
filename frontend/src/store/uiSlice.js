import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: { sidebarOpen: true, notifications: [] },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    addNotification: (state, action) => { state.notifications.push({ id: Date.now(), ...action.payload }); },
    removeNotification: (state, action) => { state.notifications = state.notifications.filter((n) => n.id !== action.payload); },
  },
});

export const { toggleSidebar, addNotification, removeNotification } = uiSlice.actions;
export default uiSlice.reducer;
