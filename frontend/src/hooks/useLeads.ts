
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  claimLead,
  getMyLeads,
  getPublicLeads,
} from "../lib/enquiries";

export function usePublicLeads(page = 1) {
  return useQuery({
    queryKey: ["leads", "public", page],
    queryFn: () => getPublicLeads(page),
  });
}

export function useMyLeads(page = 1) {
  return useQuery({
    queryKey: ["leads", "mine", page],
    queryFn: () => getMyLeads(page),
  });
}

export function useClaimLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: claimLead,
    onSuccess: async () => {
      toast.success("Lead claimed successfully!");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
      ]);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          "Unable to claim this lead. It may already be claimed.",
      );

      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}
