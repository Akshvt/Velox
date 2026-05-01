import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { analyticsService } from "../services";

export const fetchOverview = createAsyncThunk("analytics/overview", async (params) => (await analyticsService.overview(params)).data);
export const fetchTrends   = createAsyncThunk("analytics/trends",   async (params) => (await analyticsService.trends(params)).data);
export const fetchAgents   = createAsyncThunk("analytics/agents",   async (params) => (await analyticsService.agents(params)).data);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: { overview: null, trends: [], agentStats: [], status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.fulfilled, (s, a) => { s.overview = a.payload; s.status = "ok"; })
      .addCase(fetchTrends.fulfilled,   (s, a) => { s.trends = a.payload.trends; })
      .addCase(fetchAgents.fulfilled,   (s, a) => { s.agentStats = a.payload.agents; });
  },
});

export default analyticsSlice.reducer;
