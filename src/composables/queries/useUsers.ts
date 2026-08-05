import { userService } from "@/services/userService";
import type {
  UpdateUserMultipartRequest,
  UserMultipartRequest,
  UserQueryParams,
  UserRequest,
} from "@/types/user";
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
  list: (params: UserQueryParams, locale: SupportedLocale) =>
    [...useKeys.lists(), params, locale] as const,
  details: () => [...useKeys.all, "detail"] as const,
  detail: (id: string, locale?: SupportedLocale) =>
    locale ? ([...useKeys.details(), id, locale] as const) : ([...useKeys.details(), id] as const),
};

export const useUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newUserData: UserRequest) => {
      return userService.createUser(newUserData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: useKeys.lists() });
    },
  });
};

export const useUserMultipartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newUserData: UserMultipartRequest) => {
      return userService.createUserMultipart(newUserData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: useKeys.lists() });
    },
  });
};

export const useUsersQuery = (params: MaybeRefOrGetter<UserQueryParams>) => {
  const i18nStore = useI18nStore();

  return useQuery({
    queryKey: computed(() => useKeys.list(toValue(params), i18nStore.currentLocale)),
    queryFn: () => {
      return userService.getUsers(toValue(params));
    },
  });
};

export const useUserQuery = (id: MaybeRefOrGetter<string>) => {
  const i18nStore = useI18nStore();

  return useQuery({
    queryKey: computed(() => useKeys.detail(toValue(id), i18nStore.currentLocale)),
    queryFn: () => {
      return userService.getUser(toValue(id));
    },
  });
};

export const useUserUpdateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserRequest }) => {
      return userService.updateUser({ id, data });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: useKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: useKeys.lists() });
    },
  });
};

export const useUserUpdateMultipartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserMultipartRequest) => {
      return userService.updateUserMultipart(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: useKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: useKeys.lists() });
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return userService.deleteUser(id);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: useKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: useKeys.lists() });
    },
  });
};
