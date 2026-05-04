import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tickets } from "@api/services/tickets.service";
import { qk } from "@api/queryKeys";

export function useTickets(params) {
  return useQuery({
    queryKey: qk.tickets.list(params),
    queryFn: () => tickets.list(params),
  });
}

export function useTicket(id) {
  return useQuery({
    queryKey: qk.tickets.detail(id),
    queryFn: () => tickets.get(id),
    enabled: Boolean(id),
  });
}

export function useTicketStats() {
  return useQuery({
    queryKey: qk.tickets.stats,
    queryFn: () => tickets.stats(),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => tickets.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tickets.all }),
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => tickets.update(id, body),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: qk.tickets.all });
      qc.invalidateQueries({ queryKey: qk.tickets.detail(vars.id) });
    },
  });
}

export function useAssignTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, agentId }) => tickets.assign(id, agentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tickets.all }),
  });
}

export function useResolveTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => tickets.resolve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tickets.all }),
  });
}
