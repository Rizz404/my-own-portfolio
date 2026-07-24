import axiosClient from "@/api/axiosClient";
import type { SuccessResponse, PagedResponse } from "@/types/api";
import type {
  BlogAttachment,
  BlogAttachmentQueryParams,
  BlogAttachmentRequest,
} from "@/types/blogAttachment";

const BLOG_ATTACHMENT_URL = "/blog-attachments";

export const blogAttachmentService = {
  async createBlogAttachment(request: BlogAttachmentRequest) {
    const response = await axiosClient.post<SuccessResponse<BlogAttachment>>(
      BLOG_ATTACHMENT_URL,
      request,
    );

    return response.data;
  },

  async getBlogAttachments(request: BlogAttachmentQueryParams) {
    const response = await axiosClient.get<PagedResponse<BlogAttachment[]>>(BLOG_ATTACHMENT_URL, {
      params: {
        cursor: request.cursor,
        page: request.page,
        size: request.size,
        sortBy: request.sortBy,
        sortDir: request.sortDir,
      },
    });
    return response.data;
  },

  async getBlogAttachment(id: string) {
    const response = await axiosClient.get<SuccessResponse<BlogAttachment>>(
      `${BLOG_ATTACHMENT_URL}/${id}`,
    );

    return response.data;
  },

  async updateBlogAttachment(id: string, request: BlogAttachmentRequest) {
    const response = await axiosClient.patch<SuccessResponse<BlogAttachment>>(
      `${BLOG_ATTACHMENT_URL}/${id}`,
      request,
    );

    return response.data;
  },

  async deleteBlogAttachment(id: string) {
    const response = await axiosClient.delete<SuccessResponse<string>>(
      `${BLOG_ATTACHMENT_URL}/${id}`,
    );

    return response.data;
  },
};
