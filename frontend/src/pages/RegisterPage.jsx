import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerThunk, clearError } from "../store/authSlice";

export default function RegisterPage() {
  const [form, setForm] = useState({ businessName: "", name: "", email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);

  const update = (key) => (e) => { setForm({ ...form, [key]: e.target.value }); dispatch(clearError()); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerThunk(form));
    if (result.meta.requestStatus === "fulfilled") navigate("/dashboard");
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 56px)", padding: 24 }}>
      <div className="card" style={{ width: 400, maxWidth: "100%" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Create Account</h1>
        <p style={{ fontSize: 14, color: "#737373", marginBottom: 24 }}>Set up your workspace in under a minute</p>

        {error && (
          <div style={{ padding: "8px 12px", background: "#ffebee", color: "#c62828", borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>Business Name</label>
            <input className="input" value={form.businessName} onChange={update("businessName")} required />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>Your Name</label>
            <input className="input" value={form.name} onChange={update("name")} required />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>Email</label>
            <input className="input" type="email" value={form.email} onChange={update("email")} required />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 4 }}>Password</label>
            <input className="input" type="password" value={form.password} onChange={update("password")} required minLength={8} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={status === "loading"} style={{ padding: "10px 0", justifyContent: "center" }}>
            {status === "loading" ? "Creating..." : "Create Workspace"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#737373" }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600, color: "#1a1a1a" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
