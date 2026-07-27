import { blogService } from "@/services/blogService";
import type {
  BlogMultipartRequest,
  BlogQueryParams,
  BlogRequest,
  UpdateBlogMultipartRequest,
} from "@/types/blog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export const blogKeys = {
  all: ["blogs"] as const,
  lists: () => [...blogKeys.all, "list"] as const,
  list: (params: BlogQueryParams) => [...blogKeys.lists(), params] as const,
  detail: (id: string) => [...blogKeys.all, "detail", id] as const,
  details: () => [...blogKeys.all, "detail"] as const,
};

export const useBlogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newBlogData: BlogRequest) => {
      return blogService.createBlog(newBlogData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
};

export const useBlogMultipartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newBlogData: BlogMultipartRequest) => {
      return blogService.createBlogMultipart(newBlogData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
};

export const useBlogsQuery = (params: MaybeRefOrGetter<BlogQueryParams>) => {
  return useQuery({
    queryKey: computed(() => blogKeys.list(toValue(params))),
    queryFn: () => {
      return blogService.getBlogs(toValue(params));
    },
  });
};

export const useBlogQuery = (id: MaybeRefOrGetter<string>) => {
  return useQuery({
    queryKey: computed(() => blogKeys.detail(toValue(id))),
    queryFn: () => {
      return blogService.getBlog(toValue(id));
    },
  });
};

export const useBlogUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlogRequest }) => {
      return blogService.updateBlog({ id, data });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
};

export const useBlogUpdateMultipartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBlogMultipartRequest) => {
      return blogService.updateBlogMultipart(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
};

export const useDeleteBlogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return blogService.deleteBlog(id);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
};
