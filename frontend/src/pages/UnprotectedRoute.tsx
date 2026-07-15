import { getSession } from "../lib/session";
import { Navigate, Outlet } from "react-router-dom";

const UnprotectedRoute = () => {
  const { access_token } = getSession();
  return access_token ? <Navigate to={"/home"} replace /> : <Outlet />;
};

export default UnprotectedRoute;
