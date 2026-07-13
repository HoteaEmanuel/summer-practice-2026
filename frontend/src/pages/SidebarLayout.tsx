import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import NavSidebar from "../components/NavSidebar";

export function SidebarLayout() {
    return (
        <Box sx={{ display: "flex", maxWidth: "100vw", overflowX: "hidden" }}>
            <NavSidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 2, minWidth: 0, width: "100%" }}>
                <Outlet />
            </Box>
        </Box>
    );
}
