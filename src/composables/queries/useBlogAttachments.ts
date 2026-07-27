import { blogAttachmentService } from "@/services/blogAttachmentService";
import type { BlogAttachmentQueryParams, BlogAttachmentRequest } from "@/types/blogAttachment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export const blogAttachmentKeys = {
  all: ["blogAttachments"] as const,
  lists: () => [...blogAttachmentKeys.all, "list"] as const,
  list: (params: BlogAttachmentQueryParams) => [...blogAttachmentKeys.lists(), params] as const,
  detail: (id: string) => [...blogAttachmentKeys.all, "detail", id] as const,
  details: () => [...blogAttachmentKeys.all, "detail"] as const,
};

export const useBlogAttachmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newBlogAttachmentData: BlogAttachmentRequest) => {
      return blogAttachmentService.createBlogAttachment(newBlogAttachmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogAttachmentKeys.lists() });
    },
  });
};

export const useBlogAttachmentsQuery = (params: MaybeRefOrGetter<BlogAttachmentQueryParams>) => {
  return useQuery({
    queryKey: computed(() => blogAttachmentKeys.list(toValue(params))),
    queryFn: () => {
      return blogAttachmentService.getBlogAttachments(toValue(params));
    },
  });
};

export const useBlogAttachmentQuery = (id: MaybeRefOrGetter<string>) => {
  return useQuery({
    queryKey: computed(() => blogAttachmentKeys.detail(toValue(id))),
    queryFn: () => {
      return blogAttachmentService.getBlogAttachment(toValue(id));
    },
  });
};

export const useBlogAttachmentUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlogAttachmentRequest }) => {
      return blogAttachmentService.updateBlogAttachment({ id, data });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: blogAttachmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: blogAttachmentKeys.lists() });
    },
  });
};

export const useDeleteBlogAttachmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return blogAttachmentService.deleteBlogAttachment(id);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: blogAttachmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: blogAttachmentKeys.lists() });
    },
  });
};
