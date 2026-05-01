import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { logoutThunk } from "../store/authSlice";

export default function Navbar() {
  const { user, isAuth } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutThunk());
    navigate("/login");
  };

  return (
    <nav style={{
      height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", borderBottom: "1px solid #e5e5e5", background: "#fff",
    }}>
      <Link to="/" style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>
        ⚡ VELOX
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {isAuth ? (
          <>
            <Link to="/dashboard" style={{ fontSize: 14, fontWeight: 500 }}>Dashboard</Link>
            {user?.role === "admin" && <Link to="/admin" style={{ fontSize: 14, fontWeight: 500 }}>Admin</Link>}
            <span style={{ fontSize: 13, color: "#737373" }}>{user?.name}</span>
            <button onClick={handleLogout} className="btn btn-sm">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"><button className="btn btn-sm">Login</button></Link>
            <Link to="/register"><button className="btn btn-sm btn-primary">Sign Up</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}
