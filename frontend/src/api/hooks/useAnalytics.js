import { useQuery } from "@tanstack/react-query";
import { analytics } from "@api/services/analytics.service";
import { qk } from "@api/queryKeys";

export const useAnalyticsOverview = (params) =>
  useQuery({
    queryKey: qk.analytics.overview(params),
    queryFn: () => analytics.overview(params),
  });

export const useTicketsTrend = (params) =>
  useQuery({
    queryKey: qk.analytics.ticketsTrend(params),
    queryFn: () => analytics.ticketsTrend(params),
  });

export const useAgentPerformance = (params) =>
  useQuery({
    queryKey: qk.analytics.agentPerformance(params),
    queryFn: () => analytics.agentPerformance(params),
  });

export const useCategories = (params) =>
  useQuery({
    queryKey: ["analytics", "categories", params],
    queryFn: () => analytics.categories(params),
  });
