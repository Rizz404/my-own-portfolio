import axiosClient from "@/api/axiosClient";
import type { SuccessResponse, PagedResponse } from "@/types/api";
import type { Blog, BlogQueryParams, BlogRequest } from "@/types/blog";

const BLOG_URL = "/blogs";

export const blogService = {
  async createBlog(request: BlogRequest) {
    const response = await axiosClient.post<SuccessResponse<Blog>>(BLOG_URL, request);

    return response.data;
  },

  async createBlogMultipart(
    request: BlogRequest,
    featuredImageFile?: File,
    attachments?: File[],
  ) {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(request)], { type: "application/json" }));

    if (featuredImageFile) {
      formData.append("featuredImageFile", featuredImageFile);
    }

    attachments?.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await axiosClient.post<SuccessResponse<Blog>>(BLOG_URL, formData);

    return response.data;
  },

  async getBlogs(request: BlogQueryParams) {
    const response = await axiosClient.get<PagedResponse<Blog[]>>(BLOG_URL, {
      params: {
        cursor: request.cursor,
        page: request.page,
        size: request.size,
        sortBy: request.sortBy,
        sortDir: request.sortDir,
        search: request.search,
      },
    });
    return response.data;
  },

  async getBlog(id: string) {
    const response = await axiosClient.get<SuccessResponse<Blog>>(`${BLOG_URL}/${id}`);

    return response.data;
  },

  async updateBlog(id: string, request: BlogRequest) {
    const response = await axiosClient.patch<SuccessResponse<Blog>>(`${BLOG_URL}/${id}`, request);

    return response.data;
  },

  async updateBlogMultipart(
    id: string,
    request: BlogRequest,
    featuredImageFile?: File,
    newAttachments?: File[],
  ) {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(request)], { type: "application/json" }));

    if (featuredImageFile) {
      formData.append("featuredImageFile", featuredImageFile);
    }

    newAttachments?.forEach((file) => {
      formData.append("newAttachments", file);
    });

    const response = await axiosClient.patch<SuccessResponse<Blog>>(
      `${BLOG_URL}/${id}`,
      formData,
    );

    return response.data;
  },

  async deleteBlog(id: string) {
    const response = await axiosClient.delete<SuccessResponse<string>>(`${BLOG_URL}/${id}`);

    return response.data;
  },
};
