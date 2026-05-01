import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginThunk, clearError } from "../store/authSlice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginThunk({ email, password }));
    if (result.meta.requestStatus === "fulfilled") navigate("/dashboard");
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 56px)", padding: 24 }}>
      <div className="card" style={{ width: 400, maxWidth: "100%" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Sign In</h1>
        <p style={{ fontSize: 14, color: "#737373", marginBottom: 24 }}>Enter your credentials to access your dashboard</p>

        {error && (
          <div style={{ padding: "8px 12px", background: "#ffebee", color: "#c62828", borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => { setEmail(e.target.value); dispatch(clearError()); }} required />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={status === "loading"} style={{ padding: "10px 0", justifyContent: "center" }}>
            {status === "loading" ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#737373" }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: 600, color: "#1a1a1a" }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
