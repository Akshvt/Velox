import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSocket } from "./hooks/useSocket";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

function AppContent() {
  // Establish Socket.IO connection when user is authenticated
  useSocket();

  return (
    <Routes>
      {/* Public routes - with Navbar */}
      <Route path="/" element={<><Navbar /><LandingPage /></>} />
      <Route path="/login" element={<><Navbar /><LoginPage /></>} />
      <Route path="/register" element={<><Navbar /><RegisterPage /></>} />
      <Route path="/chat" element={<><Navbar /><ChatPage /></>} />

      {/* Protected routes - no top Navbar (Sidebar instead) */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminPage /></ProtectedRoute>} />
      <Route path="/admin/*" element={<ProtectedRoute roles={["admin"]}><AdminPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
