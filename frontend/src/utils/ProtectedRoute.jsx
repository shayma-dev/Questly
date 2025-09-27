// src/utils/ProtectedRoute.jsx
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthGateFallback from "../components/common/AuthGateFallback";

const ProtectedRoute = () => {
  const { status } = useAuth();
  const loc = useLocation();

  if (status === "unknown") {
    return <AuthGateFallback />; // global default while verifying session
  }

  return status === "authenticated"
    ? <Outlet />
    : <Navigate to="/" replace state={{ from: loc }} />;
};

export default ProtectedRoute;