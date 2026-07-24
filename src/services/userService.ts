import axiosClient from "@/api/axiosClient";
import type { SuccessResponse, PagedResponse } from "@/types/api";
import type { User, UserQueryParams, UserRequest } from "@/types/user";

const USER_URL = "/users";

export const userService = {
  async createUser(request: UserRequest) {
    const response = await axiosClient.post<SuccessResponse<User>>(USER_URL, request);

    return response.data;
  },

  async createUserMultipart(request: UserRequest, profilePictFile?: File) {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(request)], { type: "application/json" }));

    if (profilePictFile) {
      formData.append("profilePictFile", profilePictFile);
    }

    const response = await axiosClient.post<SuccessResponse<User>>(USER_URL, formData);

    return response.data;
  },

  async getUsers(request: UserQueryParams) {
    const response = await axiosClient.get<PagedResponse<User[]>>(USER_URL, {
      params: {
        cursor: request.cursor,
        page: request.page,
        size: request.size,
        sortBy: request.sortBy,
        sortDir: request.sortDir,
        search: request.search,
        role: request.role,
        provider: request.provider,
        gender: request.gender,
      },
    });
    return response.data;
  },

  async getUser(id: string) {
    const response = await axiosClient.get<SuccessResponse<User>>(`${USER_URL}/${id}`);

    return response.data;
  },

  async updateUser(id: string, request: UserRequest) {
    const response = await axiosClient.patch<SuccessResponse<User>>(`${USER_URL}/${id}`, request);

    return response.data;
  },

  async updateUserMultipart(id: string, request: UserRequest, profilePictFile?: File) {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(request)], { type: "application/json" }));

    if (profilePictFile) {
      formData.append("profilePictFile", profilePictFile);
    }

    const response = await axiosClient.patch<SuccessResponse<User>>(
      `${USER_URL}/${id}`,
      formData,
    );

    return response.data;
  },

  async deleteUser(id: string) {
    const response = await axiosClient.delete<SuccessResponse<string>>(`${USER_URL}/${id}`);

    return response.data;
  },
};
