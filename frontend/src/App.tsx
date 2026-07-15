import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import AddDeviceForm from "./components/DeviceForm";
import ManageUsers from "./pages/ManageUsers";
import Profile from "./pages/Profile";
import { SidebarLayout } from "./pages/SidebarLayout";
import { CssBaseline } from "@mui/material";
import ProtectedRoute from "./pages/ProtectedRoute";
import UnprotectedRoute from "./pages/UnprotectedRoute";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<SidebarLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/add-device" element={<AddDeviceForm />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/manage-users" element={<ManageUsers />} />
            </Route>
          </Route>

          <Route element={<UnprotectedRoute />}>
            <Route path="/" element={<Login />} />
            <Route path="login" element={<Login />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
