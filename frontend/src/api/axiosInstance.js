import axios from "axios";

export const api = axios.create({
  baseURL:import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true
})

api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    
    if (error.response?.status === 401 && !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token"))
       {
        console.log(originalRequest.url)
        if(originalRequest.url.includes("/auth/login")||
          originalRequest.url.includes("/auth/register")||
          originalRequest.url.includes("/auth/verify-otp"))
          {
               return Promise.reject(error);
          }
         



      originalRequest._retry = true;
        
      

      try {
        
        await axios.post(
          "http://localhost:5000/api/v1/auth/refresh-token", 
          {}, 
          { withCredentials: true }
        );

        
        return api(originalRequest);
      } catch (refreshError) {
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);