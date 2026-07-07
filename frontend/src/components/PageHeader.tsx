import { Box, Breadcrumbs, Typography, Divider } from "@mui/material";

interface PageHeaderProps {
    title: string;
    breadcrumbItems?: string[];
}

const PageHeader = ({ title, breadcrumbItems = [] }: PageHeaderProps) => {
    return (
        <Box sx={{ p: 0.5 }}>
            <Breadcrumbs aria-label="breadcrumb">
                {breadcrumbItems.map((item, index) => (
                    <Typography
                    key={index}
                    variant="subtitle2"
                    sx={{ color: index === breadcrumbItems.length - 1 ? "text.primary" : "inherit" }}
                    >
                        {item}
                    </Typography>
                ))}
            </Breadcrumbs>
            <Typography variant="h4">{title}</Typography>
        </Box>
    );
};

export default PageHeader;
