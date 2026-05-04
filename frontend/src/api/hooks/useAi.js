import { useMutation } from "@tanstack/react-query";
import { ai } from "@api/services/ai.service";

/** POST /ai/suggest-reply  - body: { ticketId } -> { suggestion } */
export function useAiSuggest() {
  return useMutation({
    mutationFn: ({ ticketId }) => ai.suggestReply(ticketId),
  });
}

/** POST /ai/summarize/:ticketId */
export function useAiSummarize() {
  return useMutation({
    mutationFn: (ticketId) => ai.summarize(ticketId),
  });
}
