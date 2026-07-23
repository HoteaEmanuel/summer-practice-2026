import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { useState, useEffect } from "react";
import { Box, Card, CardContent, Container, Grid, Typography, CircularProgress } from "@mui/material";
import DevicesIcon from "@mui/icons-material/Devices";
import BoltIcon from "@mui/icons-material/Bolt";
import EnergySavingsLeafIcon from "@mui/icons-material/EnergySavingsLeaf";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import PageHeader from "../components/PageHeader";
import { authHeaders } from "../lib/session";

function Dashboard() {
    const [data, setData] = useState({
        totalDevices: 0,
        scheduledActiveDevices: 0,
        totalPower: 0,
        energySaved: 0,
        hartData: []
    });
    const [range, setRange] = useState<"week" | "month" | "year">("week");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = () => {
            fetch(`/api/dashboard-stats?range=${range}`, { headers: { ...authHeaders() } })
                .then(res => res.json())
                .then(json => { setData(json); setLoading(false); })
                .catch(err => console.error(err));
        };

        fetchDashboardData();
        const intervalId = setInterval(fetchDashboardData, 5000);
        return () => clearInterval(intervalId);
    }, [range]);

    const stats = [
        {
            label: "Registered Devices",
            value: data.totalDevices,
            unit: "devices",
            icon: <DevicesIcon sx={{ fontSize: 40 }} />,
            color: "primary.main",
        },
        {
            label: "Scheduled Devices",
            value: data.scheduledActiveDevices,
            unit: "active schedules",
            icon: <EventIcon sx={{ fontSize: 40 }} />,
            color: "info.main",
        },
        {
            label: "Total Power Consumption",
            value: data.totalPower,
            unit: "kWh this week",
            icon: <BoltIcon sx={{ fontSize: 40 }} />,
            color: "warning.main",
        },
        {
            label: "Energy Saved",
            value: data.energySaved,
            unit: "kWh this week",
            icon: <EnergySavingsLeafIcon sx={{ fontSize: 40 }} />,
            color: "success.main",
        },
    ];

    return (
        <Container maxWidth={false} disableGutters>
            <PageHeader title="Dashboard" breadcrumbItems={["Home", "Dashboard"]} />

            {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box> : (
                <>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        {stats.map(({ label, value, unit, icon, color }) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={label}>
                                <Card elevation={2} sx={{ height: "100%" }}>
                                    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Box sx={{ color }}>{icon}</Box>
                                        <Box>
                                            <ToggleButtonGroup
                                                value={range}
                                                exclusive
                                                onChange={(_e, newRange) => newRange && setRange(newRange)}
                                                size="small"
                                                sx={{ mb: 2 }}
                                            >
                                                <ToggleButton value="week">Week</ToggleButton>
                                                <ToggleButton value="month">Month</ToggleButton>
                                                <ToggleButton value="year">Year</ToggleButton>
                                            </ToggleButtonGroup>
                                            <Typography variant="body2" color="text.secondary">{label}</Typography>
                                            <Typography variant="h4" component="p">{value}</Typography>
                                            <Typography variant="caption" color="text.secondary">{unit}</Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Card elevation={2} sx={{ mt: 3 }}>
                        <CardContent>
                            <ToggleButtonGroup
                                value={range}
                                exclusive
                                onChange={(_e, newRange) => newRange && setRange(newRange)}
                                size="small"
                                sx={{ mb: 2 }}
                            >
                                <ToggleButton value="week">Week</ToggleButton>
                                <ToggleButton value="month">Month</ToggleButton>
                                <ToggleButton value="year">Year</ToggleButton>
                            </ToggleButtonGroup>
                            <Typography variant="h6" gutterBottom>
                                Power Usage — {range.charAt(0).toUpperCase() + range.slice(1)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Consumption (kWh) across all {data.totalDevices} registered devices
                            </Typography>
                            <Box sx={{ width: "100%", height: 320 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={data.chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ed6c02" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#ed6c02" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="savedGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#2e7d32" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            label={{ value: "kWh", angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
                                        />
                                        <Tooltip
                                            formatter={(value, name) => [
                                                `${value} kWh`,
                                                name === "usage" ? "Consumption" : "Saved",
                                            ]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="usage"
                                            name="usage"
                                            stroke="#ed6c02"
                                            fill="url(#usageGradient)"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="saved"
                                            name="saved"
                                            stroke="#2e7d32"
                                            fill="url(#savedGradient)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </>
            )}
        </Container>
    );
}

export default Dashboard;