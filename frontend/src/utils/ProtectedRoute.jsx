import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { status } = useAuth();
  const loc = useLocation();
  if (status === "unknown") return <div style={{ padding: 24 }}>Loading…</div>;
  return status === "authenticated" ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace state={{ from: loc }} />
  );
};

export default ProtectedRoute;
