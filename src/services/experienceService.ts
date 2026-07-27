import axiosClient from "@/api/axiosClient";
import type { SuccessResponse, PagedResponse } from "@/types/api";
import type { Experience, ExperienceQueryParams, ExperienceRequest } from "@/types/experience";

const EXPERIENCE_URL = "/experiences";

export const experienceService = {
  async createExperience(request: ExperienceRequest) {
    const response = await axiosClient.post<SuccessResponse<Experience>>(EXPERIENCE_URL, request);

    return response.data;
  },

  async getExperiences(request: ExperienceQueryParams) {
    const response = await axiosClient.get<PagedResponse<Experience[]>>(EXPERIENCE_URL, {
      params: {
        cursor: request.cursor,
        page: request.page,
        size: request.size,
        sortBy: request.sortBy,
        sortDir: request.sortDir,
        search: request.search,
        isCurrent: request.isCurrent,
        startDate: request.startDate,
        endDate: request.endDate,
      },
    });
    return response.data;
  },

  async getExperience(id: string) {
    const response = await axiosClient.get<SuccessResponse<Experience>>(`${EXPERIENCE_URL}/${id}`);

    return response.data;
  },

  async updateExperience({ id, data }: { id: string; data: ExperienceRequest }) {
    const response = await axiosClient.patch<SuccessResponse<Experience>>(
      `${EXPERIENCE_URL}/${id}`,
      data,
    );

    return response.data;
  },

  async deleteExperience(id: string) {
    const response = await axiosClient.delete<SuccessResponse<string>>(`${EXPERIENCE_URL}/${id}`);

    return response.data;
  },
};
