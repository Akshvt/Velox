import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children, roles }) {
  const { user, token, status } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  if (status === "loading") return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
}
