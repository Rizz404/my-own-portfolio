import axiosClient from "@/api/axiosClient";
import type { SuccessResponse, PagedResponse } from "@/types/api";
import type { Use, UseQueryParams, UseRequest } from "@/types/use";

const USE_URL = "/uses";

export const useService = {
  async createUse(request: UseRequest) {
    const response = await axiosClient.post<SuccessResponse<Use>>(USE_URL, request);

    return response.data;
  },

  async createUseMultipart(request: UseRequest, logoFile?: File, pictureFiles?: File[]) {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(request)], { type: "application/json" }));

    if (logoFile) {
      formData.append("logoFile", logoFile);
    }

    pictureFiles?.forEach((file) => {
      formData.append("pictureFiles", file);
    });

    const response = await axiosClient.post<SuccessResponse<Use>>(USE_URL, formData);

    return response.data;
  },

  async getUses(request: UseQueryParams) {
    const response = await axiosClient.get<PagedResponse<Use[]>>(USE_URL, {
      params: {
        cursor: request.cursor,
        page: request.page,
        size: request.size,
        sortBy: request.sortBy,
        sortDir: request.sortDir,
        search: request.search,
        category: request.category,
      },
    });
    return response.data;
  },

  async getUse(id: string) {
    const response = await axiosClient.get<SuccessResponse<Use>>(`${USE_URL}/${id}`);

    return response.data;
  },

  async updateUse(id: string, request: UseRequest) {
    const response = await axiosClient.patch<SuccessResponse<Use>>(`${USE_URL}/${id}`, request);

    return response.data;
  },

  async updateUseMultipart(
    id: string,
    request: UseRequest,
    logoFile?: File,
    newPictureFiles?: File[],
  ) {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(request)], { type: "application/json" }));

    if (logoFile) {
      formData.append("logoFile", logoFile);
    }

    newPictureFiles?.forEach((file) => {
      formData.append("newPictureFiles", file);
    });

    const response = await axiosClient.patch<SuccessResponse<Use>>(`${USE_URL}/${id}`, formData);

    return response.data;
  },

  async deleteUse(id: string) {
    const response = await axiosClient.delete<SuccessResponse<string>>(`${USE_URL}/${id}`);

    return response.data;
  },
};
