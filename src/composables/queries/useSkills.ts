import { skillService } from "@/services/skillService";
import type {
  SkillMultipartRequest,
  SkillQueryParams,
  SkillRequest,
  UpdateSkillMultipartRequest,
} from "@/types/skill";
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
  list: (params: SkillQueryParams, locale: SupportedLocale) =>
    [...useKeys.lists(), params, locale] as const,
  details: () => [...useKeys.all, "detail"] as const,
  detail: (id: string, locale?: SupportedLocale) =>
    locale ? ([...useKeys.details(), id, locale] as const) : ([...useKeys.details(), id] as const),
};

export const useSkillMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newSkillData: SkillRequest) => {
      return skillService.createSkill(newSkillData);
    },
    // * `refetchType: "all"` - lihat komentar panjang di useDeleteSkillMutation().
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: useKeys.lists(), refetchType: "all" });
    },
  });
};

export const useSkillMultipartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newSkillData: SkillMultipartRequest) => {
      return skillService.createSkillMultipart(newSkillData);
    },
    // * `refetchType: "all"` - lihat komentar panjang di useDeleteSkillMutation().
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: useKeys.lists(), refetchType: "all" });
    },
  });
};

export const useSkillsQuery = (params: MaybeRefOrGetter<SkillQueryParams>) => {
  const i18nStore = useI18nStore();

  return useQuery({
    queryKey: computed(() => useKeys.list(toValue(params), i18nStore.currentLocale)),
    queryFn: () => {
      return skillService.getSkills(toValue(params));
    },
  });
};

export const useSkillQuery = (id: MaybeRefOrGetter<string>) => {
  const i18nStore = useI18nStore();

  return useQuery({
    queryKey: computed(() => useKeys.detail(toValue(id), i18nStore.currentLocale)),
    queryFn: () => {
      return skillService.getSkill(toValue(id));
    },
  });
};

export const useSkillUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SkillRequest }) => {
      return skillService.updateSkill({ id, data });
    },
    // * `refetchType: "all"` - lihat komentar panjang di useDeleteSkillMutation().
    onSuccess: (_data, variables) => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: useKeys.detail(variables.id),
          refetchType: "all",
        }),
        queryClient.invalidateQueries({ queryKey: useKeys.lists(), refetchType: "all" }),
      ]);
    },
  });
};

export const useSkillUpdateMultipartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSkillMultipartRequest) => {
      return skillService.updateSkillMultipart(data);
    },
    // * `refetchType: "all"` - lihat komentar panjang di useDeleteSkillMutation().
    onSuccess: (_data, variables) => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: useKeys.detail(variables.id),
          refetchType: "all",
        }),
        queryClient.invalidateQueries({ queryKey: useKeys.lists(), refetchType: "all" }),
      ]);
    },
  });
};

export const useDeleteSkillMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return skillService.deleteSkill(id);
    },
    // * Sengaja di-`return` (bukan fire-and-forget), dan `refetchType: "all"` - lihat
    // komentar panjang di useDeleteProjectMutation() (useProjects.ts).
    onSuccess: (_data, id) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: useKeys.detail(id), refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: useKeys.lists(), refetchType: "all" }),
      ]);
    },
  });
};
