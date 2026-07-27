import { projectService } from "@/services/projectService";
import type {
  ProjectMultipartRequest,
  ProjectQueryParams,
  ProjectRequest,
  UpdateProjectMultipartRequest,
} from "@/types/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params: ProjectQueryParams) => [...projectKeys.lists(), params] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
  details: () => [...projectKeys.all, "detail"] as const,
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
  return useQuery({
    queryKey: computed(() => projectKeys.list(toValue(params))),
    queryFn: () => {
      return projectService.getProjects(toValue(params));
    },
  });
};

export const useProjectQuery = (id: MaybeRefOrGetter<string>) => {
  return useQuery({
    queryKey: computed(() => projectKeys.detail(toValue(id))),
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
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};
