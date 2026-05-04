import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chat } from "@api/services/chat.service";
import { qk } from "@api/queryKeys";

export function useChatHistory(conversationId) {
  return useQuery({
    queryKey: qk.chat.history(conversationId),
    queryFn: () => chat.history(conversationId),
    enabled: Boolean(conversationId),
  });
}

export function useSendMessage(conversationId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => chat.send(conversationId, body),
    // Optimistic: append to cache immediately
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: qk.chat.history(conversationId) });
      const prev = qc.getQueryData(qk.chat.history(conversationId));
      const optimistic = {
        id: `tmp-${Date.now()}`,
        from: body.from || "user",
        text: body.text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        pending: true,
      };
      qc.setQueryData(qk.chat.history(conversationId), (old) =>
        Array.isArray(old) ? [...old, optimistic] : [optimistic],
      );
      return { prev };
    },
    onError: (_err, _body, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.chat.history(conversationId), ctx.prev);
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: qk.chat.history(conversationId) }),
  });
}

export function useEscalateChat() {
  return useMutation({
    mutationFn: ({ sessionId, ...body }) => chat.escalate(sessionId, body),
  });
}
