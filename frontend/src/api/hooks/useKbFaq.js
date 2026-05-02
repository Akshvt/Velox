import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kb } from "@api/services/kb.service";
import { faq } from "@api/services/faq.service";
import { qk } from "@api/queryKeys";

/* -------- Knowledge Base -------- */
export const useKbArticles = (params) =>
  useQuery({
    queryKey: qk.kb.list(params),
    queryFn: () => kb.list(params),
  });

export const useKbArticle = (id) =>
  useQuery({
    queryKey: qk.kb.detail(id),
    queryFn: () => kb.get(id),
    enabled: Boolean(id),
  });

export const useKbCategories = () =>
  useQuery({
    queryKey: qk.kb.categories,
    queryFn: () => kb.categories(),
  });

export function useCreateKbArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => kb.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.kb.all }),
  });
}

export function useUpdateKbArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => kb.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.kb.all }),
  });
}

export function useRemoveKbArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => kb.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.kb.all }),
  });
}

/* -------- FAQ -------- */
export const useFaq = (params) =>
  useQuery({
    queryKey: qk.faq.list(params),
    queryFn: () => faq.list(params),
  });

export function useUpsertFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) =>
      id ? faq.update(id, body) : faq.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.faq.all }),
  });
}

export function useRemoveFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => faq.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.faq.all }),
  });
}
