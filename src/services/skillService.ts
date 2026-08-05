import axiosClient from "@/api/axiosClient";
import type { SuccessResponse, PagedResponse } from "@/types/api";
import type {
  UpdateSkillMultipartRequest,
  Skill,
  SkillMultipartRequest,
  SkillQueryParams,
  SkillRequest,
} from "@/types/skill";

const USE_URL = "/skills";

export const skillService = {
  async createSkill(request: SkillRequest) {
    const response = await axiosClient.post<SuccessResponse<Skill>>(USE_URL, request);

    return response.data;
  },

  async createSkillMultipart(request: SkillMultipartRequest) {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(request.skillRequest)], { type: "application/json" }),
    );

    if (request.logoFile) {
      formData.append("logoFile", request.logoFile);
    }

    const response = await axiosClient.post<SuccessResponse<Skill>>(USE_URL, formData);

    return response.data;
  },

  async getSkills(request: SkillQueryParams) {
    const response = await axiosClient.get<PagedResponse<Skill[]>>(USE_URL, {
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

  async getSkill(id: string) {
    const response = await axiosClient.get<SuccessResponse<Skill>>(`${USE_URL}/${id}`);

    return response.data;
  },

  async updateSkill({ id, data }: { id: string; data: SkillRequest }) {
    const response = await axiosClient.patch<SuccessResponse<Skill>>(`${USE_URL}/${id}`, data);

    return response.data;
  },

  async updateSkillMultipart(request: UpdateSkillMultipartRequest) {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(request.skillRequest)], { type: "application/json" }),
    );

    if (request.logoFile) {
      formData.append("logoFile", request.logoFile);
    }

    const response = await axiosClient.patch<SuccessResponse<Skill>>(
      `${USE_URL}/${request.id}`,
      formData,
    );

    return response.data;
  },

  async deleteSkill(id: string) {
    const response = await axiosClient.delete<SuccessResponse<string>>(`${USE_URL}/${id}`);

    return response.data;
  },
};
