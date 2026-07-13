import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Box,
    Avatar,
    IconButton,
    Typography,
    Toolbar,
} from "@mui/material";
import { Home } from "@mui/icons-material";
import CellTowerIcon from "@mui/icons-material/CellTower";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { useNavigate } from "react-router-dom";

const DRAWER_WIDTH = 240;

const NavSidebar = () => {
    const navigate = useNavigate();

    const logoutUser = () => {
        sessionStorage.clear();
        navigate("/login");
    };

    const role = sessionStorage.getItem("role");
    const fullName = sessionStorage.getItem("name") || "User";
    const isAdmin = role && role.includes("admin");

    const navItems = [
        { label: "Home", icon: <Home />, path: "/home" },
        { label: "Dashboard", icon: <BarChartIcon />, path: "/dashboard" },
        { label: "Devices", icon: <CellTowerIcon />, path: "/devices" },
        ...(isAdmin ? [{ label: "Manage Users", icon: <ManageAccountsIcon />, path: "/manage-users" }] : []),
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: DRAWER_WIDTH,
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                },
            }}
        >
            <Box sx={{ overflow: "auto", flexGrow: 1 }}>
                <List>
                    {navItems.map(({ label, icon, path }) => (
                        <ListItem key={label} disablePadding>
                            <ListItemButton onClick={() => navigate(path)}>
                                <ListItemIcon>{icon}</ListItemIcon>
                                <ListItemText primary={label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate("/profile")}>
                        <ListItemIcon>
                            <Avatar sx={{ width: 32, height: 32 }} />
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography variant="body2" noWrap>
                                    {fullName}
                                </Typography>
                            }
                        />
                        <IconButton
                            edge="end"
                            aria-label="logout"
                            onClick={(e) => {
                                e.stopPropagation();
                                logoutUser();
                            }}
                            size="small"
                        >
                            <LogoutIcon fontSize="small" />
                        </IconButton>
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default NavSidebar;
