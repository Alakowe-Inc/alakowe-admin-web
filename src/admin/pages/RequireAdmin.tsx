import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

const ADMIN_ROLE = "Admin";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();
  const authed = sessionStorage.getItem("alakowe_admin_authed") === "1";
  const role = sessionStorage.getItem("alakowe_admin_role");

  if (!authed) {
    if (localStorage.getItem("alakowe_user")) {
      localStorage.removeItem("alakowe_user");
      localStorage.removeItem("token");
    }
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (role && role !== ADMIN_ROLE) {
    sessionStorage.removeItem("alakowe_admin_authed");
    sessionStorage.removeItem("alakowe_admin_token");
    sessionStorage.removeItem("alakowe_admin_role");
    localStorage.removeItem("alakowe_user");
    localStorage.removeItem("token");
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
