import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access");

    if (token && config.headers) {
      config.headers.set?.("Authorization", `Bearer ${token}`);
      // fallback for older typings:
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;