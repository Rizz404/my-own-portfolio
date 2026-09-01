import { projectService } from "@/services/projectService";
import type {
  ProjectMultipartRequest,
  ProjectQueryParams,
  ProjectRequest,
  UpdateProjectMultipartRequest,
} from "@/types/project";
import type { SupportedLocale } from "@/i18n";
import { useI18nStore } from "@/stores/i18nStores";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  // * `locale` wajib di sini biar tiap locale punya cache & fetch sendiri-sendiri.
  // Key buat invalidateQueries (lists()/detail() tanpa locale) tetep match semua locale
  // karena TanStack Query nge-match queryKey secara prefix.
  list: (params: ProjectQueryParams, locale: SupportedLocale) =>
    [...projectKeys.lists(), params, locale] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string, locale?: SupportedLocale) =>
    locale
      ? ([...projectKeys.details(), id, locale] as const)
      : ([...projectKeys.details(), id] as const),
};

export const useProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProjectData: ProjectRequest) => {
      return projectService.createProject(newProjectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

export const useProjectMultipartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProjectData: ProjectMultipartRequest) => {
      return projectService.createProjectMultipart(newProjectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

export const useProjectsQuery = (params: MaybeRefOrGetter<ProjectQueryParams>) => {
  const i18nStore = useI18nStore();

  return useQuery({
    queryKey: computed(() => projectKeys.list(toValue(params), i18nStore.currentLocale)),
    queryFn: () => {
      return projectService.getProjects(toValue(params));
    },
  });
};

export const useProjectQuery = (id: MaybeRefOrGetter<string>) => {
  const i18nStore = useI18nStore();

  return useQuery({
    queryKey: computed(() => projectKeys.detail(toValue(id), i18nStore.currentLocale)),
    queryFn: () => {
      return projectService.getProject(toValue(id));
    },
  });
};

export const useProjectUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectRequest }) => {
      return projectService.updateProject({ id, data });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

export const useProjectUpdateMultipartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjectMultipartRequest) => {
      return projectService.updateProjectMultipart(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return projectService.deleteProject(id);
    },
    // * Sengaja di-`return` (bukan fire-and-forget) - TanStack Query nunggu promise ini
    // kelar sebelum mutateAsync() resolve, jadi caller (mis. ProjectsView.vue) baru
    // nganggep "delete selesai" pas list query BENERAN udah ke-refetch, bukan pas
    // invalidateQueries() cuma di-trigger. Tanpa ini, UI yang gantungin deleting-state ke
    // mutateAsync() (buat nyembunyiin spinner/disable tombol) bakal nyembunyiin loading-nya
    // duluan sebelum grid sempet re-render tanpa item yang baru kehapus.
    onSuccess: (_data, id) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: projectKeys.lists() }),
      ]);
    },
  });
};
