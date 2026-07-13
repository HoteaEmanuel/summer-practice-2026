import { Dialog, DialogProps } from "@mui/material";

const DockedDialog = ({
    children,
    slotProps,
    ...props
}: Omit<DialogProps, "slotProps"> & { slotProps?: any }) => {
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

export default DockedDialog;
