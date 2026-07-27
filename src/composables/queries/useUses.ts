import { useService } from "@/services/useService";
import type {
  UseMultipartRequest,
  UseQueryParams,
  UseRequest,
  UpdateUseMultipartRequest,
} from "@/types/use";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export const useKeys = {
  all: ["uses"] as const,
  lists: () => [...useKeys.all, "list"] as const,
  list: (params: UseQueryParams) => [...useKeys.lists(), params] as const,
  detail: (id: string) => [...useKeys.all, "detail", id] as const,
  details: () => [...useKeys.all, "detail"] as const,
};

export const useUseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newUseData: UseRequest) => {
      return useService.createUse(newUseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: useKeys.lists() });
    },
  });
};

export const useUseMultipartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newUseData: UseMultipartRequest) => {
      return useService.createUseMultipart(newUseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: useKeys.lists() });
    },
  });
};

export const useUsesQuery = (params: MaybeRefOrGetter<UseQueryParams>) => {
  return useQuery({
    queryKey: computed(() => useKeys.list(toValue(params))),
    queryFn: () => {
      return useService.getUses(toValue(params));
    },
  });
};

export const useUseQuery = (id: MaybeRefOrGetter<string>) => {
  return useQuery({
    queryKey: computed(() => useKeys.detail(toValue(id))),
    queryFn: () => {
      return useService.getUse(toValue(id));
    },
  });
};

export const useUseUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UseRequest }) => {
      return useService.updateUse({ id, data });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: useKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: useKeys.lists() });
    },
  });
};

export const useUseUpdateMultipartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUseMultipartRequest) => {
      return useService.updateUseMultipart(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: useKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: useKeys.lists() });
    },
  });
};

export const useDeleteUseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return useService.deleteUse(id);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: useKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: useKeys.lists() });
    },
  });
};
