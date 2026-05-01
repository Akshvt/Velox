import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import ticketReducer from "./ticketSlice";
import chatReducer from "./chatSlice";
import adminReducer from "./adminSlice";
import analyticsReducer from "./analyticsSlice";
import uiReducer from "./uiSlice";

const store = configureStore({
  reducer: {
    auth:      authReducer,
    tickets:   ticketReducer,
    chat:      chatReducer,
    admin:     adminReducer,
    analytics: analyticsReducer,
    ui:        uiReducer,
  },
});

export default store;
