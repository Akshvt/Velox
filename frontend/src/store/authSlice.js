import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../services";
import { setToken } from "../services/api";

export const loginThunk = createAsyncThunk("auth/login", async (creds, { rejectWithValue }) => {
  try {
    const { data } = await authService.login(creds);
    setToken(data.accessToken);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || "Login failed"); }
});

export const registerThunk = createAsyncThunk("auth/register", async (form, { rejectWithValue }) => {
  try {
    const { data } = await authService.register(form);
    setToken(data.accessToken);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || "Registration failed"); }
});

export const getMeThunk = createAsyncThunk("auth/getMe", async (_, { rejectWithValue }) => {
  try {
    // This will implicitly trigger the 401 interceptor which fetches a new access token
    // via the refresh token httpOnly cookie if the in-memory token is empty on reload.
    const { data } = await authService.getMe();
    return data.user;
  } catch (err) { return rejectWithValue(err.response?.data?.message || "Session expired"); }
});

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try { await authService.logout(); } catch { /* ignore */ }
  setToken(null);
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null, status: "idle", error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending,    (s) => { s.status = "loading"; s.error = null; })
      .addCase(loginThunk.fulfilled,  (s, a) => { s.status = "ok"; s.user = a.payload.user; s.token = a.payload.accessToken; })
      .addCase(loginThunk.rejected,   (s, a) => { s.status = "failed"; s.error = a.payload; })
      .addCase(registerThunk.pending,   (s) => { s.status = "loading"; s.error = null; })
      .addCase(registerThunk.fulfilled, (s, a) => { s.status = "ok"; s.user = a.payload.user; s.token = a.payload.accessToken; })
      .addCase(registerThunk.rejected,  (s, a) => { s.status = "failed"; s.error = a.payload; })
      .addCase(getMeThunk.fulfilled, (s, a) => { s.status = "ok"; s.user = a.payload; })
      .addCase(getMeThunk.rejected,  (s) => { s.status = "idle"; s.user = null; s.token = null; })
      .addCase(logoutThunk.fulfilled, (s) => { s.user = null; s.token = null; s.status = "idle"; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
