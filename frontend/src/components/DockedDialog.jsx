import PropTypes from "prop-types";
import { Dialog } from "@mui/material";

/**
 * Right-docked dialog panel that fills viewport height.
 * @param {import('@mui/material').DialogProps} props
 */
const DockedDialog = ({ children, slotProps, ...props }) => {
    return (
        <Dialog
            {...props}
            fullWidth
            maxWidth={false}
            sx={{
                "& .MuiDialog-container": {
                    justifyContent: "flex-end",
                    alignItems: "stretch",
                },
                ...(props.sx || {}),
            }}
            slotProps={{
                ...slotProps,
                paper: {
                    ...(slotProps?.paper || {}),
                    sx: {
                        m: 0,
                        height: "100dvh",
                        maxHeight: "100dvh",
                        width: { xs: "100%", sm: 720 },
                        borderRadius: 0,
                        ...(slotProps?.paper?.sx || {}),
                    },
                },
            }}
        >
            {children}
        </Dialog>
    );
};

DockedDialog.propTypes = {
    children: PropTypes.node,
    slotProps: PropTypes.object,
};

export default DockedDialog;
