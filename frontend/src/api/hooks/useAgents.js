import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agents } from "@api/services/agents.service";
import { qk } from "@api/queryKeys";

export function useAgents(params) {
  return useQuery({
    queryKey: qk.agents.list(params),
    queryFn: () => agents.list(params),
  });
}

export function useAgent(id) {
  return useQuery({
    queryKey: qk.agents.detail(id),
    queryFn: () => agents.get(id),
    enabled: Boolean(id),
  });
}

export function useInviteAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => agents.invite(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.agents.all }),
  });
}

export function useUpdateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => agents.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.agents.all }),
  });
}

export function useRemoveAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => agents.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.agents.all }),
  });
}
