import { getSession } from "../lib/session";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { access_token } = getSession();
  return access_token ? <Outlet /> : <Navigate to={"/login"} replace />;
};

export default ProtectedRoute;
