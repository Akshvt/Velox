import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@lib/constants";

/**
 * Auth store — holds current user + access token.
 * Refresh token is set as httpOnly cookie by the backend.
 *
 * The access token is mirrored to `localStorage.velox.accessToken`
 * because the axios interceptor + socket client read from there.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: ({ user, accessToken }) => {
        if (accessToken) {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        }
        set({ user, accessToken, isAuthenticated: !!user });
      },
      clearAuth: () => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    { name: STORAGE_KEYS.AUTH },
  ),
);
