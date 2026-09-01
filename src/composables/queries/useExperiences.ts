import { experienceService } from "@/services/experienceService";
import type { ExperienceQueryParams, ExperienceRequest } from "@/types/experience";
import type { SupportedLocale } from "@/i18n";
import { useI18nStore } from "@/stores/i18nStores";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export const experienceKeys = {
  all: ["experiences"] as const,
  lists: () => [...experienceKeys.all, "list"] as const,
  // * `locale` wajib di sini biar tiap locale punya cache & fetch sendiri-sendiri.
  // Key buat invalidateQueries (lists()/detail() tanpa locale) tetep match semua locale
  // karena TanStack Query nge-match queryKey secara prefix.
  list: (params: ExperienceQueryParams, locale: SupportedLocale) =>
    [...experienceKeys.lists(), params, locale] as const,
  details: () => [...experienceKeys.all, "detail"] as const,
  detail: (id: string, locale?: SupportedLocale) =>
    locale
      ? ([...experienceKeys.details(), id, locale] as const)
      : ([...experienceKeys.details(), id] as const),
};

export const useExperienceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newExperienceData: ExperienceRequest) => {
      return experienceService.createExperience(newExperienceData);
    },
    // * `refetchType: "all"` - lihat komentar panjang di useDeleteExperienceMutation().
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: experienceKeys.lists(),
        refetchType: "all",
      });
    },
  });
};

export const useExperiencesQuery = (params: MaybeRefOrGetter<ExperienceQueryParams>) => {
  const i18nStore = useI18nStore();

  return useQuery({
    queryKey: computed(() => experienceKeys.list(toValue(params), i18nStore.currentLocale)),
    queryFn: () => {
      return experienceService.getExperiences(toValue(params));
    },
  });
};

export const useExperienceQuery = (id: MaybeRefOrGetter<string>) => {
  const i18nStore = useI18nStore();

  return useQuery({
    queryKey: computed(() => experienceKeys.detail(toValue(id), i18nStore.currentLocale)),
    queryFn: () => {
      return experienceService.getExperience(toValue(id));
    },
  });
};

export const useExperienceUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExperienceRequest }) => {
      return experienceService.updateExperience({ id, data });
    },
    // * `refetchType: "all"` - lihat komentar panjang di useDeleteExperienceMutation().
    onSuccess: (_data, variables) => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: experienceKeys.detail(variables.id),
          refetchType: "all",
        }),
        queryClient.invalidateQueries({ queryKey: experienceKeys.lists(), refetchType: "all" }),
      ]);
    },
  });
};

export const useDeleteExperienceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return experienceService.deleteExperience(id);
    },
    // * Sengaja di-`return` (bukan fire-and-forget), dan `refetchType: "all"` - lihat
    // komentar panjang di useDeleteProjectMutation() (useProjects.ts).
    onSuccess: (_data, id) => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: experienceKeys.detail(id),
          refetchType: "all",
        }),
        queryClient.invalidateQueries({ queryKey: experienceKeys.lists(), refetchType: "all" }),
      ]);
    },
  });
};
