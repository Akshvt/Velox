import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

let inMemoryToken = null;

export const setToken = (token) => {
  inMemoryToken = token;
};

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true, // Send HttpOnly cookies for refresh token
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  if (inMemoryToken) config.headers.Authorization = `Bearer ${inMemoryToken}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Only attempt refresh if 401, not already retried, and not the refresh endpoint itself
    if (error.response?.status === 401 && !original._retry && original.url !== "/auth/refresh") {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh");
        const newToken = data.accessToken;
        setToken(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        setToken(null);
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
