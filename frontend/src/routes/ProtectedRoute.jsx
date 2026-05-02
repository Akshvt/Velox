import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@store/authStore";

/**
 * Wrap any route element that should require authentication.
 * Optionally pass `roles` to restrict by role:
 *   <ProtectedRoute roles={["admin"]}><AdminPanel /></ProtectedRoute>
 */
export default function ProtectedRoute({ roles, children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && user?.role && !roles.includes(user.role)) {
    const home = user.role === "admin" ? "/admin" : "/agent";
    return <Navigate to={home} replace />;
  }

  return children;
}
