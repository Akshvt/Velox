import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reports } from "@api/services/reports.service";
import { settings } from "@api/services/settings.service";
import { qk } from "@api/queryKeys";

/* -------- Reports -------- */
export const useReports = () =>
  useQuery({ queryKey: qk.reports.all, queryFn: () => reports.list() });

export const useReport = (id) =>
  useQuery({
    queryKey: qk.reports.detail(id),
    queryFn: () => reports.get(id),
    enabled: Boolean(id),
  });

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => reports.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.reports.all }),
  });
}

/* -------- Settings -------- */
export const useWorkspaceSettings = () =>
  useQuery({
    queryKey: qk.settings.workspace,
    queryFn: () => settings.workspace(),
  });

export const useProfileSettings = () =>
  useQuery({
    queryKey: qk.settings.profile,
    queryFn: () => settings.profile(),
  });

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => settings.updateProfile(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.settings.profile }),
  });
}

export const useNotificationSettings = () =>
  useQuery({
    queryKey: qk.settings.notifications,
    queryFn: () => settings.notifications(),
  });

export function useUpdateNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => settings.updateNotifications(body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: qk.settings.notifications }),
  });
}
