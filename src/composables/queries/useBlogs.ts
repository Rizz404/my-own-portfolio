import { blogService } from "@/services/blogService";
import type {
  BlogMultipartRequest,
  BlogQueryParams,
  BlogRequest,
  UpdateBlogMultipartRequest,
} from "@/types/blog";
import type { SupportedLocale } from "@/i18n";
import { useI18nStore } from "@/stores/i18nStores";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export const blogKeys = {
  all: ["blogs"] as const,
  lists: () => [...blogKeys.all, "list"] as const,
  // * `locale` wajib di sini biar tiap locale punya cache & fetch sendiri-sendiri.
  // Key buat invalidateQueries (lists()/detail() tanpa locale) tetep match semua locale
  // karena TanStack Query nge-match queryKey secara prefix.
  list: (params: BlogQueryParams, locale: SupportedLocale) =>
    [...blogKeys.lists(), params, locale] as const,
  details: () => [...blogKeys.all, "detail"] as const,
  detail: (id: string, locale?: SupportedLocale) =>
    locale ? ([...blogKeys.details(), id, locale] as const) : ([...blogKeys.details(), id] as const),
};

export const useBlogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newBlogData: BlogRequest) => {
      return blogService.createBlog(newBlogData);
    },
    // * `refetchType: "all"` - lihat komentar panjang di useDeleteBlogMutation().
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: blogKeys.lists(), refetchType: "all" });
    },
  });
};

export const useBlogMultipartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newBlogData: BlogMultipartRequest) => {
      return blogService.createBlogMultipart(newBlogData);
    },
    // * `refetchType: "all"` - lihat komentar panjang di useDeleteBlogMutation().
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: blogKeys.lists(), refetchType: "all" });
    },
  });
};

export const useBlogsQuery = (params: MaybeRefOrGetter<BlogQueryParams>) => {
  const i18nStore = useI18nStore();

  return useQuery({
    queryKey: computed(() => blogKeys.list(toValue(params), i18nStore.currentLocale)),
    queryFn: () => {
      return blogService.getBlogs(toValue(params));
    },
  });
};

export const useBlogQuery = (id: MaybeRefOrGetter<string>) => {
  const i18nStore = useI18nStore();

  return useQuery({
    queryKey: computed(() => blogKeys.detail(toValue(id), i18nStore.currentLocale)),
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
    // * `refetchType: "all"` - lihat komentar panjang di useDeleteBlogMutation().
    onSuccess: (_data, variables) => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: blogKeys.detail(variables.id),
          refetchType: "all",
        }),
        queryClient.invalidateQueries({ queryKey: blogKeys.lists(), refetchType: "all" }),
      ]);
    },
  });
};

export const useBlogUpdateMultipartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBlogMultipartRequest) => {
      return blogService.updateBlogMultipart(data);
    },
    // * `refetchType: "all"` - lihat komentar panjang di useDeleteBlogMutation().
    onSuccess: (_data, variables) => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: blogKeys.detail(variables.id),
          refetchType: "all",
        }),
        queryClient.invalidateQueries({ queryKey: blogKeys.lists(), refetchType: "all" }),
      ]);
    },
  });
};

export const useDeleteBlogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return blogService.deleteBlog(id);
    },
    // * Sengaja di-`return` (bukan fire-and-forget), dan `refetchType: "all"` - lihat
    // komentar panjang di useDeleteProjectMutation() (useProjects.ts).
    onSuccess: (_data, id) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: blogKeys.detail(id), refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: blogKeys.lists(), refetchType: "all" }),
      ]);
    },
  });
};
