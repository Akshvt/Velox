import axios from "axios";
import { STORAGE_KEYS } from "@lib/constants";

/**
 * Backend contract:
 *   - Express server mounts every route under `/api/*`
 *   - Access token: `Authorization: Bearer <jwt>` header
 *   - Refresh token: httpOnly cookie `refreshToken` (must send credentials)
 *   - 401 on protected routes -> client calls POST /auth/refresh -> retries
 *
 * VITE_API_URL should be the backend ORIGIN only (e.g. "http://localhost:5000").
 * The "/api" suffix is appended here so endpoints stay clean (`/auth/login`).
 */
const API_ORIGIN =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";
const API_BASE = `${API_ORIGIN}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send/receive httpOnly refresh cookie
  headers: { "Content-Type": "application/json" },
});

/* -------- Request: attach access token -------- */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* -------- Response: auto-refresh on 401 -------- */
let isRefreshing = false;
let waiters = [];

const flushWaiters = (err, token) => {
  waiters.forEach(({ resolve, reject }) => {
    if (err) reject(err);
    else resolve(token);
  });
  waiters = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Don't try to refresh the refresh endpoint itself or non-401s
    if (
      status !== 401 ||
      original?._retry ||
      original?.url?.includes("/auth/refresh") ||
      original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/register")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until refresh resolves
      return new Promise((resolve, reject) => {
        waiters.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await apiClient.post("/auth/refresh");
      const newToken = data?.accessToken;
      if (!newToken) throw new Error("No accessToken in refresh response");

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken);
      flushWaiters(null, newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch (err) {
      flushWaiters(err, null);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      // Soft redirect — only when we're in the browser & not already on /login
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = "/login";
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
