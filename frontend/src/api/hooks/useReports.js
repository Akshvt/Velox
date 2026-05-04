import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportService } from "../services/report.service";

export const useReports = () => {
  return useQuery({
    queryKey: ["reports"],
    queryFn: reportService.list,
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};
