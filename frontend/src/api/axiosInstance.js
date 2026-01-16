import axios from "axios";

export const api = axios.create({
  baseURL:import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true
})

api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url.includes("/login") || 
        originalRequest.url.includes("/refresh-token") ||
        originalRequest.url.includes("/register")
      ) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      try {
        const refreshUrl = originalRequest.url.includes("/admin/") 
          ? "/admin/auth/refresh-token" 
          : "/auth/refresh-token";

        await api.post(refreshUrl);

        return api(originalRequest); 
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
   return Promise.reject(error);
  }
);