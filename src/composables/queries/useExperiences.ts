import { experienceService } from "@/services/experienceService";
import type { ExperienceQueryParams, ExperienceRequest } from "@/types/experience";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export const experienceKeys = {
  all: ["experiences"] as const,
  lists: () => [...experienceKeys.all, "list"] as const,
  list: (params: ExperienceQueryParams) => [...experienceKeys.lists(), params] as const,
  detail: (id: string) => [...experienceKeys.all, "detail", id] as const,
  details: () => [...experienceKeys.all, "detail"] as const,
};

export const useExperienceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newExperienceData: ExperienceRequest) => {
      return experienceService.createExperience(newExperienceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: experienceKeys.lists() });
    },
  });
};

export const useExperiencesQuery = (params: MaybeRefOrGetter<ExperienceQueryParams>) => {
  return useQuery({
    queryKey: computed(() => experienceKeys.list(toValue(params))),
    queryFn: () => {
      return experienceService.getExperiences(toValue(params));
    },
  });
};

export const useExperienceQuery = (id: MaybeRefOrGetter<string>) => {
  return useQuery({
    queryKey: computed(() => experienceKeys.detail(toValue(id))),
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: experienceKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: experienceKeys.lists() });
    },
  });
};

export const useDeleteExperienceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return experienceService.deleteExperience(id);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: experienceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: experienceKeys.lists() });
    },
  });
};
