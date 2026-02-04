import { api } from "../../../api/axiosInstance";

export const saveCategory = async ({ editingCategory, formData }) => {
  const config = { headers: { "Content-Type": "multipart/form-data" } };
  
  if (editingCategory) {
    const res = await api.patch(`/admin/categories/${editingCategory._id}`, formData, config);
    return res.data;
  } else {
    const res = await api.post("/admin/categories", formData, config);
    return res.data;
  }
};