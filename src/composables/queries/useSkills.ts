import { skillService } from "@/services/skillService";
import type {
  SkillMultipartRequest,
  SkillQueryParams,
  SkillRequest,
  UpdateSkillMultipartRequest,
} from "@/types/skill";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export const useKeys = {
  all: ["uses"] as const,
  lists: () => [...useKeys.all, "list"] as const,
  list: (params: SkillQueryParams) => [...useKeys.lists(), params] as const,
  detail: (id: string) => [...useKeys.all, "detail", id] as const,
  details: () => [...useKeys.all, "detail"] as const,
};

export const useSkillMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newSkillData: SkillRequest) => {
      return skillService.createSkill(newSkillData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: useKeys.lists() });
    },
  });
};

export const useSkillMultipartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newSkillData: SkillMultipartRequest) => {
      return skillService.createSkillMultipart(newSkillData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: useKeys.lists() });
    },
  });
};

export const useSkillsQuery = (params: MaybeRefOrGetter<SkillQueryParams>) => {
  return useQuery({
    queryKey: computed(() => useKeys.list(toValue(params))),
    queryFn: () => {
      return skillService.getSkills(toValue(params));
    },
  });
};

export const useSkillQuery = (id: MaybeRefOrGetter<string>) => {
  return useQuery({
    queryKey: computed(() => useKeys.detail(toValue(id))),
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: useKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: useKeys.lists() });
    },
  });
};

export const useSkillUpdateMultipartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSkillMultipartRequest) => {
      return skillService.updateSkillMultipart(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: useKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: useKeys.lists() });
    },
  });
};

export const useDeleteSkillMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return skillService.deleteSkill(id);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: useKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: useKeys.lists() });
    },
  });
};
