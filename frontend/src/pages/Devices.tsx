import { useState, useEffect, useMemo } from "react";
import ScheduleForm from "../components/ScheduleForm";
import {
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Container,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Box,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EventIcon from "@mui/icons-material/Event";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import DeviceForm from "../components/DeviceForm";
import PageHeader from "../components/PageHeader";
import { Device } from "../types/devices.types";

type ActionType = "schedule" | "edit" | "remove" | null;

const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const DeviceTable = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);

  const [alwaysOn, setAlwaysOn] = useState(false);
  const [onTime, setOnTime] = useState("08:00");
  const [offTime, setOffTime] = useState("16:00");
  const [activeDays, setActiveDays] = useState<string[]>(["MON", "TUE", "WED", "THU", "FRI"]);

  const fetchDevices = async () => {
    try {
      const response = await fetch("/api/devices", {
        cache: "no-store",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache"
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.status}`);
      }
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleScheduleOpen = (device: Device) => {
    setSelectedDevice(device);
    
    const schedule = (device as any).schedule;
    
    if (schedule && Object.keys(schedule).length > 0) {
      setAlwaysOn(schedule.alwaysOn !== undefined ? schedule.alwaysOn : false);
      setOnTime(schedule.onTime || "08:00");
      setOffTime(schedule.offTime || "16:00");
      setActiveDays(schedule.activeDays || ["MON", "TUE", "WED", "THU", "FRI"]);
    } else {
      setAlwaysOn(false);
      setOnTime("08:00");
      setOffTime("16:00");
      setActiveDays(["MON", "TUE", "WED", "THU", "FRI"]);
    }

    setIsScheduleDialogOpen(true);
    setSelectedAction("schedule");
  };

  const handleScheduleClose = () => {
    setIsScheduleDialogOpen(false);
    setSelectedAction(null);
    setSelectedDevice(null);
  };

  const handleDayToggle = (event: React.MouseEvent<HTMLElement>, newDays: string[]) => {
    setActiveDays(newDays);
  };

  const handleConfirmRemove = async () => {
    if (!deviceToDelete) return;
    const deviceId = (deviceToDelete as any)._id?.$oid || (deviceToDelete as any)._id;
    await handleRemove(deviceId);
    setDeviceToDelete(null);
  };

  const handleCancelRemove = () => {
    setDeviceToDelete(null);
  };

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch("/api/device/" + id, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to delete device: ${response.status}`);
      }
      fetchDevices(); 
    } catch (error) {
      console.error("Error deleting device:", error);
    }
  };

  const handleStartEdit = (device: Device) => {
    setEditingDevice(device);
    setIsAddDialogOpen(true);
  };

  const handleAction = (action: ActionType, device: Device) => {
    switch (action) {
      case "schedule":
        handleScheduleOpen(device);
        break;
      case "edit":
        handleStartEdit(device);
        break;
      case "remove":
        setDeviceToDelete(device);
        break;
      default:
        break;
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: "deviceName", header: "Device Name" },
      { accessorKey: "deviceSlNo", header: "Serial Number" },
      { accessorKey: "deviceType", header: "Device Type" },
      { accessorKey: "hwType", header: "Hardware Type" },
      { accessorKey: "site", header: "Site" },
      { accessorKey: "group", header: "Group" },
      { accessorKey: "owner", header: "Owner" },
      {
        id: "connection",
        header: "Connection",
        accessorFn: (row: any) => {
          const type = row.connectivityType || "-";
          const ip = row.ip || "-";
          const port = row.port || "-";
          return `${type} | ${ip}:${port}`;
        },
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: devices,
    enableRowActions: true,
    positionActionsColumn: "last",
    paginationDisplayMode: "pages",
    initialState: { pagination: { pageSize: 5, pageIndex: 0 } },
    muiPaginationProps: {
      color: "primary",
      shape: "rounded",
      variant: "outlined",
      showRowsPerPage: true,
    },
    muiTableContainerProps: {},
    muiTablePaperProps: { elevation: 0 },
    renderTopToolbarCustomActions: () => (
      <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddDialogOpen}>
        Add Device
      </Button>
    ),
    renderRowActionMenuItems: ({ row, closeMenu }) => [
      <MenuItem key="schedule" onClick={() => { handleAction("schedule", row.original); closeMenu(); }} sx={{ py: 1.5, px: 2 }}>
        <ListItemIcon><EventIcon fontSize="small" color="primary" /></ListItemIcon>
        <ListItemText>Programa</ListItemText>
      </MenuItem>,
      <MenuItem key="edit" onClick={() => { handleAction("edit", row.original); closeMenu(); }} sx={{ py: 1.5, px: 2 }}>
        <ListItemIcon><EditIcon fontSize="small" sx={{ color: 'text.secondary' }} /></ListItemIcon>
        <ListItemText>Edita</ListItemText>
      </MenuItem>,
      <MenuItem key="remove" onClick={() => { handleAction("remove", row.original); closeMenu(); }} sx={{ py: 1.5, px: 2, color: "error.main" }}>
        <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
        <ListItemText>Elimina</ListItemText>
      </MenuItem>,
    ],
  });

  const handlePerformAction = async () => {
    if (!selectedDevice) return;
    try {
      switch (selectedAction) {
        case "schedule":
          // Perform schedule action with selectedDevice._id
          console.log(`Scheduled action for device ${selectedDevice._id}`);
          break;
        case "edit":
          // Perform edit action with selectedDevice._id
          break;
        case "remove":
          // Perform remove action with selectedDevice._id
          break;
        default:
          break;
      }
      handleScheduleClose();
    } catch (error) {
      console.error("Error performing action:", error);
    }
  };

  const handleAddDialogOpen = () => {
    setEditingDevice(null);
    setIsAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingDevice(null);
  };

  const handleAddDeviceSuccess = () => {
    fetchDevices();
  };

  return (
    <Container maxWidth={false} disableGutters>
      <PageHeader title="Devices" breadcrumbItems={["Home", "Devices"]} />
      <MaterialReactTable table={table} />
      <Dialog open={isScheduleDialogOpen} onClose={handleScheduleClose}>
        <DialogTitle>Schedule Action</DialogTitle>
        <DialogContent>
          {/* Add content for scheduling here */}
          Schedule dialog content...
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScheduleClose}>Cancel</Button>
          <Button onClick={handlePerformAction} color="primary">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={Boolean(deviceToDelete)} onClose={handleCancelRemove}>
        <DialogTitle>Delete Device</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{deviceToDelete?.deviceName}"? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemove}>Cancel</Button>
          <Button onClick={handleConfirmRemove} color="error" variant="contained">
           Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      <DeviceForm open={isAddDialogOpen} device={editingDevice} onClose={handleAddDialogClose} onSuccess={handleAddDeviceSuccess} />
    </Container>
  );
};

export default DeviceTable;