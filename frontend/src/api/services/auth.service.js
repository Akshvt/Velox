import { http } from "./_http";

/**
 * Backend: backend/src/routes/auth.routes.js
 *
 * Response shapes:
 *   register/login -> { success, accessToken, user: { id, name, email, role, tenantId } }
 *   refresh        -> { success, accessToken }
 *   me             -> { success, user }
 *   logout         -> { success, message }
 *
 * Refresh token is set as httpOnly cookie (`refreshToken`) by the server.
 * The access token must be stored client-side and sent as `Authorization: Bearer`.
 */
export const auth = {
  /** body: { businessName, name, email, password } */
  register: (body) => http.post("/auth/register", body),
  /** body: { email, password } */
  login: (body) => http.post("/auth/login", body),
  refresh: () => http.post("/auth/refresh"),
  logout: () => http.post("/auth/logout"),
  me: () => http.get("/auth/me"),
  /** body: { name?, email? } -> PUT */
  updateProfile: (body) => http.put("/auth/profile", body),
  /** body: { currentPassword, newPassword } -> PUT */
  updatePassword: (body) => http.put("/auth/password", body),
};
