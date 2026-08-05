import { useService } from "@/services/useService";
import type {
  UseMultipartRequest,
  UseQueryParams,
  UseRequest,
  UpdateUseMultipartRequest,
} from "@/types/use";
import type { SupportedLocale } from "@/i18n";
import { useI18nStore } from "@/stores/i18nStores";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export const useKeys = {
  all: ["uses"] as const,
  lists: () => [...useKeys.all, "list"] as const,
  // * `locale` wajib di sini biar tiap locale punya cache & fetch sendiri-sendiri.
  // Key buat invalidateQueries (lists()/detail() tanpa locale) tetep match semua locale
  // karena TanStack Query nge-match queryKey secara prefix.
  list: (params: UseQueryParams, locale: SupportedLocale) =>
    [...useKeys.lists(), params, locale] as const,
  details: () => [...useKeys.all, "detail"] as const,
  detail: (id: string, locale?: SupportedLocale) =>
    locale ? ([...useKeys.details(), id, locale] as const) : ([...useKeys.details(), id] as const),
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
  const i18nStore = useI18nStore();

  return useQuery({
    queryKey: computed(() => useKeys.list(toValue(params), i18nStore.currentLocale)),
    queryFn: () => {
      return useService.getUses(toValue(params));
    },
  });
};

export const useUseQuery = (id: MaybeRefOrGetter<string>) => {
  const i18nStore = useI18nStore();

  return useQuery({
    queryKey: computed(() => useKeys.detail(toValue(id), i18nStore.currentLocale)),
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
