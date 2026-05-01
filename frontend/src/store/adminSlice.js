import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminService } from "../services";

export const fetchUsers    = createAsyncThunk("admin/fetchUsers",    async () => (await adminService.listUsers()).data);
export const fetchFAQs     = createAsyncThunk("admin/fetchFAQs",     async (params) => (await adminService.listFAQs(params)).data);
export const fetchSettings = createAsyncThunk("admin/fetchSettings", async () => (await adminService.getSettings()).data);

const adminSlice = createSlice({
  name: "admin",
  initialState: { users: [], faqs: [], settings: null, status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled,    (s, a) => { s.users = a.payload.users; })
      .addCase(fetchFAQs.fulfilled,     (s, a) => { s.faqs = a.payload.faqs; })
      .addCase(fetchSettings.fulfilled, (s, a) => { s.settings = a.payload; });
  },
});

export default adminSlice.reducer;
