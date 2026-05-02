import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute.jsx";

const Home = lazy(() => import("@pages/Home.jsx"));
const Chat = lazy(() => import("@pages/Chat.jsx"));
const Login = lazy(() => import("@pages/Login.jsx"));
const Register = lazy(() => import("@pages/Register.jsx"));
const AgentDashboard = lazy(() => import("@pages/AgentDashboard.jsx"));
const AdminPanel = lazy(() => import("@pages/AdminPanel.jsx"));
const Analytics = lazy(() => import("@pages/Analytics.jsx"));
const KnowledgeBase = lazy(() => import("@pages/KnowledgeBase.jsx"));
const FAQManagement = lazy(() => import("@pages/FAQManagement.jsx"));
const Reports = lazy(() => import("@pages/Reports.jsx"));
const Agents = lazy(() => import("@pages/Agents.jsx"));
const Settings = lazy(() => import("@pages/Settings.jsx"));
const StubPage = lazy(() => import("@pages/StubPage.jsx"));
const NotFound = lazy(() => import("@pages/NotFound.jsx"));

const adminOnly = ["admin"];
const agentOrAdmin = ["agent", "admin"];

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="center min-h-screen">Loading…</div>}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Agent flow */}
        <Route
          path="/agent"
          element={
            <ProtectedRoute roles={agentOrAdmin}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin flow */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={adminOnly}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/agents"
          element={
            <ProtectedRoute roles={adminOnly}>
              <Agents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute roles={adminOnly}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/knowledge-base"
          element={
            <ProtectedRoute roles={agentOrAdmin}>
              <KnowledgeBase />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faq"
          element={
            <ProtectedRoute roles={agentOrAdmin}>
              <FAQManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute roles={adminOnly}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute roles={agentOrAdmin}>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
