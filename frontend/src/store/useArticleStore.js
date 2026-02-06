
import { create } from "zustand";
import axiosInstance from "../axios"; // 

export const useArticleStore = create((set) => ({
  loading: false,
  error: null,

  uploadInlineImage :async (file) => {
  const formData = new FormData();
  formData.append("image", file); 

  const response = await axiosInstance.post("/blogs/upload-inline-image/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.url; 
},


  saveBlog: async ({ mode, blogData, title, content, coverImage }) => {
    if (!title || !content) throw new Error("Title and content are required");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (coverImage) {
      formData.append("images", coverImage);
    }

    const url =
      mode === "edit"
        ? `/blogs/${blogData.id}/edit/`
        : "/blogs/upload/";

    const method = mode === "edit" ? "put" : "post";

    try {
      set({ loading: true, error: null });

      const res = await axiosInstance({ method, url, data: formData, headers: { "Content-Type": "multipart/form-data" }, });

      return res.data;
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          err.response?.data ||
          "Failed to save blog",
      });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));