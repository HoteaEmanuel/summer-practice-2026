import { Link as RouterLink } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PowerOffRoundedIcon from "@mui/icons-material/PowerOffRounded";

const NotFound = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
        backgroundColor: "#F4F7F7",
      }}
    >
      <PowerOffRoundedIcon sx={{ fontSize: 96, color: "primary.main" }} />

      <Typography variant="h2" sx={{ mt: 2 }}>
        404
      </Typography>

      <Typography variant="h5" gutterBottom>
        Page not found
      </Typography>

      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        The page you are looking for doesn&apos;t exist.
      </Typography>

      <Button
        component={RouterLink}
        to="/home"
        variant="contained"
        sx={{ mt: 4 }}
      >
        Back to Home
      </Button>
    </Box>
  );
};

export default NotFound;
