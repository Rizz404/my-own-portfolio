import { userService } from "@/services/userService";
import type {
  UpdateUserMultipartRequest,
  UserMultipartRequest,
  UserQueryParams,
  UserRequest,
} from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export const useKeys = {
  all: ["uses"] as const,
  lists: () => [...useKeys.all, "list"] as const,
  list: (params: UserQueryParams) => [...useKeys.lists(), params] as const,
  detail: (id: string) => [...useKeys.all, "detail", id] as const,
  details: () => [...useKeys.all, "detail"] as const,
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
  return useQuery({
    queryKey: computed(() => useKeys.list(toValue(params))),
    queryFn: () => {
      return userService.getUsers(toValue(params));
    },
  });
};

export const useUserQuery = (id: MaybeRefOrGetter<string>) => {
  return useQuery({
    queryKey: computed(() => useKeys.detail(toValue(id))),
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
