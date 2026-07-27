import axiosClient from "@/api/axiosClient";
import type { SuccessResponse, PagedResponse } from "@/types/api";
import type {
  Project,
  ProjectMultipartRequest,
  ProjectQueryParams,
  ProjectRequest,
  UpdateProjectMultipartRequest,
} from "@/types/project";

const PROJECT_URL = "/projects";

export const projectService = {
  async createProject(request: ProjectRequest) {
    const response = await axiosClient.post<SuccessResponse<Project>>(PROJECT_URL, request);

    return response.data;
  },

  async createProjectMultipart(request: ProjectMultipartRequest) {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(request.projectRequest)], { type: "application/json" }),
    );

    if (request.logoFile) {
      formData.append("logoFile", request.logoFile);
    }

    request.imageFiles?.forEach((file) => {
      formData.append("imageFiles", file);
    });

    const response = await axiosClient.post<SuccessResponse<Project>>(PROJECT_URL, formData);

    return response.data;
  },

  async getProjects(request: ProjectQueryParams) {
    const response = await axiosClient.get<PagedResponse<Project[]>>(PROJECT_URL, {
      params: {
        cursor: request.cursor,
        page: request.page,
        size: request.size,
        sortBy: request.sortBy,
        sortDir: request.sortDir,
        search: request.search,
        status: request.status,
      },
    });
    return response.data;
  },

  async getProject(id: string) {
    const response = await axiosClient.get<SuccessResponse<Project>>(`${PROJECT_URL}/${id}`);

    return response.data;
  },

  async updateProject({ id, data }: { id: string; data: ProjectRequest }) {
    const response = await axiosClient.patch<SuccessResponse<Project>>(
      `${PROJECT_URL}/${id}`,
      data,
    );

    return response.data;
  },

  async updateProjectMultipart(request: UpdateProjectMultipartRequest) {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(request.projectRequest)], { type: "application/json" }),
    );

    if (request.logoFile) {
      formData.append("logoFile", request.logoFile);
    }

    request.newImageFiles?.forEach((file) => {
      formData.append("newImageFiles", file);
    });

    const response = await axiosClient.patch<SuccessResponse<Project>>(
      `${PROJECT_URL}/${request.id}`,
      formData,
    );

    return response.data;
  },

  async deleteProject(id: string) {
    const response = await axiosClient.delete<SuccessResponse<string>>(`${PROJECT_URL}/${id}`);

    return response.data;
  },
};
